# schift-io/schift-ko-pii-v7

## Resumen

schift-ko-pii-v7 es un modelo de detección de información personal identificable (PII) en coreano, desarrollado por schift-io. Se trata de un modelo de clasificación de tokens (*token-classification*) de aproximadamente 40 millones de parámetros, construido sobre la arquitectura LFM2 (familia de modelos ligeros de Liquid AI) y especializado en reconocer entidades como nombres de personas y direcciones en texto coreano. Su propósito es servir como motor de detección dentro de un flujo de trabajo de privacidad que va desde la detección hasta el enmascaramiento selectivo de datos sensibles.

La versión v7 (paquete `0.6.0`) sustituye la arquitectura de doble ruta con LoRA de la v6 por un diseño "hydra" en el que las capas inferiores se comparten (congeladas) y las capas superiores se han ajustado de forma independiente para las torres de persona y dirección. Esta decisión permite que cada dominio tenga su propia ruta de capas superiores, a costa de renunciar temporalmente a la detección de organizaciones, que queda pospuesta a una versión futura.

El modelo es relevante en el contexto del cumplimiento normativo de privacidad en coreano: ofrece una API de detección, evaluación de riesgo, enmascaramiento por políticas y una cola de revisión, todo ello con un tamaño reducido (0,2 GB de repositorio) que facilita su despliegue en entornos de producción con requisitos de latencia y coste moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (encoder "hydra": capas inferiores compartidas y congeladas, con dos pilas superiores independientes para persona y dirección) |
| Parametros totales | 40.002.190 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | schift-2.0 (licencia propia, marcada como "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LFM2 y la adapta a una estructura de tipo "hydra": un tronco inferior compartido y congelado del que emergen dos pilas de capas superiores ajustadas de manera independiente, una para la detección de personas y otra para direcciones. Esta separación resuelve la limitación de la v6, donde persona y dirección compartían una única ruta superior y solo se diferenciaban en la cabeza de clasificación; en la v7 cada torre tiene parámetros propios, lo que permite especializar mejor cada dominio. La tarea es de clasificación de tokens con etiquetas como `private_person` y `private_phone`, entre otras.

No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición detallada del corpus, más allá de que se trata de un dataset propio (`custom`). La model card menciona que los datos de entrenamiento carecen de ejemplos de registro formal/legal para nombres de organizaciones (por ejemplo, el nombre de un ministerio o empresa como sujeto de una cláusula legal), motivo por el cual la detección de organizaciones se ha retirado en esta versión. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Detección de PII en coreano mediante clasificación de tokens, con etiquetas tipadas como `private_person`, `private_phone` y `private_address`.
- Detección de fechas de nacimiento como dato identificativo (`private_date`), con la regla de que solo los cumpleaños se consideran identificativos.
- Evaluación de riesgo operacional separada de la confianza del detector, con modos de procesamiento `AUDIT`, `PERMISSIVE`, `STRICT`, `BALANCED` y `PARANOID`.
- Enmascaramiento selectivo basado en políticas: solo se enmascaran los fragmentos cuya acción es `BLOCK`; los de acción `REVIEW` quedan sin enmascarar y se registran en una cola de revisión.
- Estrategias de enmascaramiento configurables: `TOKEN` (sustitución por etiqueta estable como `[PII_PHONE_1]`), `REDACT` (`[REDACTED]`), `PARTIAL` (conserva una porción inicial y final) y `HASHED` (digest SHA-256 determinista local).
- Perfiles extendidos opcionales mediante el extra `extended`: `structured` (números de registro empresarial, identificadores de seguro médico y receta, PNU, código postal, fax, identificadores de empleado, documento, petición y fármaco) y `contextual` (añade nacionalidad, fecha de nacimiento, educación, especialidad, puesto, edad, altura y peso).
- Flujo de retroalimentación tipado (`FeedbackPatch` mediante `propose_feedback_patch()`) sin persistir PII en bruto.
- No dispone de soporte de tool calling, agentes, visión ni audio según la información disponible.

## Casos de uso

- Redacción de documentos legales: el modelo detecta nombres de personas y direcciones en escritos judiciales coreanos (como en el ejemplo de la model card, "피고 김민수의 전화번호는...") y permite enmascararlos antes de compartir el documento con terceros o publicarlo.
- Cumplimiento de privacidad en pipelines de datos: integrado en un proceso de ingesta, `analyze_text()` aplica políticas de bloqueo y genera una versión enmascarada del texto antes de almacenarlo en registros o bases de datos analíticas.
- Atención al cliente automatizada: permite filtrar conversaciones multi-turno en coreano para eliminar teléfonos, nombres y direcciones antes de enviar transcripciones a sistemas de análisis o a APIs externas.
- Moderación y revisión humana asistida: los fragmentos clasificados como `REVIEW` se enrutan a una cola de revisión con metadatos únicamente, de modo que los operadores pueden validar casos dudosos sin exponer PII en bruto en la interfaz.
- Anonimización para investigación: con la estrategia `HASHED` se generan identificadores deterministas que permiten correlacionar registros entre conjuntos de datos sin revelar la identidad subyacente.
- Detección de identificadores estructurados en formularios: con el perfil `extended="structured"` se reconocen números de registro empresarial, códigos postales, identificadores de seguro médico y números de prescripción en documentos administrativos coreanos.
- Enmascaramiento parcial para verificación: la estrategia `PARTIAL` conserva una pequeña porción inicial y final del dato, útil en flujos donde un operador necesita confirmar visualmente la coincidencia sin ver el valor completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 40 millones de parámetros en safetensors, el peso del modelo en precisión completa ronda los 160 MB, y el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPU de consumo, aunque la información proporcionada no especifica modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: la model card menciona un servicio ONNX en Cloud Run bajo `services/pii` como carril de despliegue separado, que no se incluye en el paquete. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- La versión v7 no detecta organizaciones; el soporte se pospuso a una versión futura porque el corpus carece de ejemplos de registro formal/legal. Si el flujo de trabajo depende de la detección de organizaciones, debe mantenerse la versión `schift-ko-pii<0.6` (v6).
- El texto enmascarado (`masking.masked_text`) es una salida de política, no una cadena segura para egreso no confiable: debe aplicarse un paso de redacción de todos los fragmentos antes de enviarlo a registros, APIs externas u otras superficies no confiables.
- Solo se enmascaran los fragmentos con acción `BLOCK`; los de acción `REVIEW` permanecen sin enmascarar en el resultado y requieren gestión por parte del llamador.
- El modelo está entrenado únicamente para coreano; no se documenta soporte multilingüe.
- No se documentan sesgos conocidos ni tasas de alucinación, aunque al ser un modelo de clasificación de tokens el riesgo de alucinación generativa no aplica del mismo modo.
- La licencia es `schift-2.0` (marcada como "other"), por lo que las restricciones de uso comercial deben consultarse en el archivo LICENSE del repositorio; no se detallan en la información disponible.
- La instalación base no incluye `ko-pii`; las categorías deterministas adicionales requieren el extra `extended`.
- No se documentan la longitud de contexto ni los tipos de cuantización soportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schift-io/schift-ko-pii-v7
- Licencia (referenciada en la model card): LICENSE del repositorio
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
