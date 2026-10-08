# aildan/signrule-decide-4b

## Resumen

SignRule-Decide 4B es un modelo de decisión tipado, desarrollado por el usuario aildan, especializado en interpretar las reglas de representación y firma (Vertretungsbefugnis) que aparecen en los registros mercantiles oficiales. A diferencia de un LLM generativo, recibe el texto del registro, la forma jurídica y los roles registrados (con los nombres enmascarados) y responde a un conjunto fijo de preguntas devolviendo probabilidades calibradas por opción, con capacidad de abstenerse cuando la confianza no alcanza el nivel de riesgo elegido. Nunca genera texto libre.

Su uso principal es el Firmenbuch austríaco, que publica la redacción de la Vertretungsbefugnis de cada apoderado sin interpretación automática. El modelo se construye sobre el backbone Qwen/Qwen3.5-4B-Base congelado, al que se añade un adaptador LoRA y una cabeza de puntero (pointer head) propia de la librería Kev. Está pensado como herramienta de apoyo a la decisión en procesos de KYB (know your business) y onboarding, siempre con revisión humana.

El interés actual radica en su enfoque de clasificación calibrada con abstención controlada estadísticamente (Learn-then-Test), poco habitual en modelos legales, y en que sus etiquetas proceden de los propios registros oficiales (Noruega y Austria), no de anotaciones sintéticas ni de modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B-Base congelado) + adaptador LoRA + cabeza de puntero Kev |
| Parametros totales | Aproximadamente 4 000 millones en el backbone (segun el nombre del modelo base); adaptador LoRA y cabeza adicionales no cuantificados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones; adaptador en safetensors y cabeza en estado PyTorch (.pt), backbone en bf16 |
| Idiomas soportados | Aleman (de), noruego bokmal (nb), noruego nynorsk (nn), danes (da) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), head.pt (cabeza de puntero), calibracion en JSON |

## Arquitectura y entrenamiento

El modelo no es un LLM convencional sino un sistema de decisión tipado. Sobre el backbone Qwen/Qwen3.5-4B-Base, que permanece congelado en bf16, se entrena un adaptador LoRA con rango r = 16 y alfa = 32 aplicado a las proyecciones de atención, MLP y Gated DeltaNet. La lectura final la realiza una cabeza de puntero Kev que asigna una ranura por opción y aplica softmax sobre las opciones, de modo que la salida es siempre una distribución de probabilidad sobre respuestas predefinidas y no texto generado. El entrenamiento se realizó durante 2 épocas con AdamW, tasa de aprendizaje 5e-5 para el adaptador y 1e-4 para la cabeza, forward con prefijo compartido y semilla 13.

Los datos de entrenamiento son textos reales de registros con etiquetas tomadas de los propios registros, sin ejemplos sintéticos ni anotaciones de modelos de lenguaje. Noruega (Brønnøysundregistrene, licencia NLOD) aporta 25 394 casos de entrenamiento a partir de las reglas de firma de la Fullmakttjenesten, con etiquetas procedentes del intérprete oficial del registro. Austria (Firmenbuch HVD, CC BY 4.0) aporta 6 197 casos con los códigos de representación por persona (E/G) y una tabla de coincidencia exacta revisada manualmente para poderes conjuntos. Dinamarca se usa únicamente como conjunto de evaluación zero-shot. En total se procesaron 1 020 612 empresas y se obtuvieron 31 591 casos de entrenamiento, con 37,7 millones de tokens en 2 épocas. Los splits se hacen por clúster de texto (Noruega) y por patrón normalizado por fecha (Austria), de modo que ningún texto idéntico aparece a la vez en entrenamiento y prueba. Los nombres se sustituyen por `[PERSON_n]`, las empresas por `[FIRMA_n]` y se descartan fechas de nacimiento e identificadores personales.

## Capacidades

- Clasificación calibrada de reglas de firma y representación sobre texto de registro mercantil: responde a preguntas fijas sobre cargos, coaliciones de firma, número mínimo de firmantes, tipo de regla y procuration.
- Salida con probabilidades por opción calibradas mediante temperatura específica por tipo, en lugar de texto generado.
- Abstención controlada por el riesgo: umbrales Learn-then-Test con niveles alfa = 1 %, 2 % y 5 % ajustados por registro, de modo que el sistema marca `abstain` cuando no puede responder dentro del riesgo elegido.
- Respuesta a un conjunto fijo de preguntas definido en `configs/questions.yaml`, que incluye preguntas de cargo, once preguntas de coalición, mínimo de firmantes, tipo de regla, procuration, parseabilidad y ambigüedad (esta última experimental).
- Capacidad multilingüe limitada a textos de registro en alemán, noruego (bokmal y nynorsk) y danés.
- No dispone de generación de texto, tool calling, function calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Apoyo a la decisión en KYB y onboarding: el modelo prellena el campo "¿quién puede vincular esta empresa?" a partir de un extracto del registro, mostrando al revisor la probabilidad calibrada y el indicador de abstención, que forman parte obligatoria de la respuesta.
- Cumplimiento normativo en entidades financieras: automatiza la primera pasada sobre altas de clientes empresariales austríacos, reduciendo el trabajo manual del analista y dejando los casos ambiguos para revisión humana.
- Enriquecimiento de bases de datos de registro mercantil: procesa por lotes extractos del Firmenbuch y de Brønnøysundregistrene para poblar estructuras de representación con códigos normalizados.
- Verificación de poderes en notarías y asesorías jurídicas austríacas: consulta puntual sobre la Vertretungsbefugnis de un apoderado concreto antes de formalizar un documento.
- Detección de casos ambiguos o no parseables: gracias a la abstención calibrada, el sistema escala automáticamente los extractos de redacción inusual o poco frecuente en lugar de arriesgar una respuesta.
- Auditoría y due diligence previa a la firma de contratos: comprobación de que el firmante propuesto dispone efectivamente de poder de representación según el registro, con un registro de la probabilidad asociada.
- Control de calidad sobre pipelines existentes: uso del modelo como segunda opinión frente a una regla heurística o a la tabla `phrase_at`, comparando ambas salidas en el mismo extracto.

## Benchmarks y rendimiento

No se han publicado en la información disponible resultados numéricos completos de benchmarks. La model card describe la metodología de evaluación pero la tabla de resultados aparece truncada.

Elementos de evaluación documentados:

- Conjuntos de referencia construidos a partir de las respuestas independientes de dos asistentes de IA que siguieron guías escritas; solo se conservan las respuestas en las que ambos coinciden, y una persona revisó una muestra. Las cifras miden, por tanto, acuerdo con un consenso de IA, no con etiquetas plenamente humanas.
- El coeficiente kappa de Cohen entre ambos asistentes se encuentra en `results/gold/`.
- Austria: 400 extractos de texto libre en dos lotes, el segundo centrado en consejos de administración y sociedades colectivas.
- Las partes de prueba etiquetadas por el registro usan los códigos propios del registro como etiquetas.
- Para cada cifra austríaca se reporta junto a ella una línea base `phrase_at` (la misma tabla de coincidencia exacta usada como predictor).

Los valores concretos de precisión, recall, F1 u otras métricas no están disponibles en la información proporcionada.

## Requisitos de hardware

- Entrenamiento documentado: 1 x NVIDIA GeForce RTX 5090 (31,8 GB), con Intel Core i9-14900KF y 92 GB de RAM; 14,6 horas de entrenamiento LoRA en bf16, pico de memoria de GPU de 20,2 GB y 7 836 pasos de optimizador.
- Inferencia: el backbone Qwen3.5-4B-Base se descarga en el primer arranque. En bf16 los pesos del backbone rondan los 8 GB, por lo que se estima que cabría en GPUs de consumo con 12 GB o más de VRAM, aunque la cifra exacta de VRAM en inferencia no está documentada.
- GPUs recomendadas: una RTX 5090 es suficiente y fue la usada en entrenamiento; una RTX 4090 (24 GB) o superior debería cubrir la inferencia con holgura. No hay datos publicados para A100, H100 u otras GPUs de centro de datos.
- Latencia y throughput de servicio: con un checkpoint anterior de la misma arquitectura de 4B, media de 8,5 preguntas por petición, p50 de 160 ms, p95 de 175 ms y 6,7 peticiones por segundo.
- Despliegue: el servidor de referencia se ejecuta desde el repositorio `signrule-decide` (con `uv`) y sirve en `http://localhost:8300/v1/systemone`. Ollama (v0.35+) sirve modelos de decisión sobre la misma API `/v1/systemone` para las arquitecturas Clef, Laya y Strands Decider, pero este checkpoint está en el formato de Kev, que Ollama todavía no carga. No se documenta soporte para vLLM, llama.cpp, TGI ni Ollama con este checkpoint.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de clasificación calibrada de reglas de firma sobre registros mercantiles. Se trata de una tarea muy específica, con un adaptador y una cabeza de decisión propios, por lo que la comparación directa con LLM generativos de tamaño similar no resulta significativa.

## Limitaciones y advertencias

- Ámbito geográfico restringido: el modelo está diseñado para los registros de Austria y Noruega; Dinamarca solo se usó como prueba zero-shot. Cualquier otro registro queda fuera de alcance sin una nueva evaluación.
- No ofrece asesoramiento jurídico. Es una herramienta de apoyo a la decisión y requiere revisión humana.
- Solo cubre los poderes que figuran en el texto del registro; no contempla poderes recogidos en estatutos sociales, límites internos ni acuerdos no publicados.
- Protección de datos: no debe enviarse información personal al modelo. Los nombres deben enmascararse antes de la petición; el sistema espera marcadores `[PERSON_n]` y `[FIRMA_n]`.
- Riesgo de alucinación acotado por diseño: al no generar texto y trabajar con opciones cerradas y abstención calibrada, el modo de fallo típico sería una clasificación errónea con alta confianza, no la invención de texto.
- Las cifras de evaluación miden acuerdo con un consenso de asistentes de IA, no con etiquetas plenamente humanas, lo que puede sobreestimar el rendimiento real frente a anotación humana.
- Idiomas soportados limitados a alemán, noruego (bokmal y nynorsk) y danés; no hay soporte documentado para castellano ni otros idiomas.
- Dependencia del backbone Qwen/Qwen3.5-4B-Base, que debe descargarse en el primer arranque y cuya licencia Apache-2.0 aplica de forma independiente.
- Soporte de despliegue limitado: el checkpoint en formato Kev no es cargable por Ollama en su versión actual; hay que usar el servidor de referencia.
- Licencia Apache-2.0, sin restricciones documentadas para uso comercial, pero con las advertencias de ámbito y protección de datos indicadas.

## Enlaces

- HuggingFace: https://huggingface.co/aildan/signrule-decide-4b
- Repositorio GitHub: https://github.com/aliildan/signrule-decide
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Fichero de demostración: `results/demo/demo-de.md` (dentro del repositorio)
- Configuración de preguntas: `configs/questions.yaml` (dentro del repositorio)
- Resultados de referencia y kappa de Cohen: `results/gold/` (dentro del repositorio)
- No se han encontrado papers, blogs ni demos adicionales en los resultados de búsqueda web disponibles.
