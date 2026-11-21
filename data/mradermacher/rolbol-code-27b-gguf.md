# mradermacher/RolBol-Code-27B-GGUF

## Resumen

RolBol Code 27B es un modelo de lenguaje especializado en generación de código y flujos de trabajo agénticos, desarrollado originalmente por Rolbol07 y cuantizado a formato GGUF por mradermacher. El modelo cuenta con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones) y está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La versión aquí descrita es una recopilación de cuantizaciones estáticas en GGUF pensadas para inferencia local con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que el repositorio GGUF facilita el despliegue del modelo en hardware de consumo mediante cuantizaciones que van desde Q2_K (11,3 GB) hasta Q8_0 (29,1 GB), pasando por las recomendadas Q4_K_M (17,1 GB) y Q5_K_M (19,7 GB). El modelo base está etiquetado para tareas de código, coding agéntico y autonomous-coding, lo que lo posiciona en el segmento de asistentes de programación que ejecutan pasos múltiples de forma autónoma.

No se dispone de información pública sobre la longitud de contexto, la arquitectura interna detallada ni los datos de entrenamiento en la documentación proporcionada. La model card del repositorio GGUF se limita a listar las cuantizaciones disponibles y a remitir al modelo base para más detalles técnicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; detalles internos no publicados en la informacion disponible) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; sin imatrix) |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo base Rolbol07/RolBol-Code-27B en la información disponible. El repositorio GGUF indica que se trata de un modelo de la familia transformers con 27.320.697.856 parámetros, etiquetado para generación de texto, código y uso agéntico. No se especifica si emplea attention lineal, decodificación especulativa, mezcla de expertos u otras innovaciones técnicas.

Tampoco se dispone de datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card del repositorio GGUF es una plantilla estándar de mradermacher que remite al modelo original para cualquier detalle técnico, y no incluye información sobre el proceso de entrenamiento.

## Capacidades

- Generación de texto y código: el modelo está etiquetado explícitamente para tareas de coding y generación de código.
- Coding agéntico: las etiquetas agentic y autonomous-coding indican soporte previsto para flujos de trabajo multi-paso con ejecución autónoma de tareas.
- Soporte multilingüe: la etiqueta multilingual sugiere capacidad de trabajo en varios idiomas, aunque solo se declara inglés (en) de forma explícita.
- Conversación: el repositorio incluye la etiqueta conversational, lo que indica formato de chat multi-turno.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integración con infraestructuras de inferencia estándar.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación en local: el modelo puede desplegarse con llama.cpp u Ollama usando la cuantización Q4_K_M (17,1 GB) para autocompletar y generar funciones en un equipo con GPU de consumo, sin depender de servicios en la nube.
- Refactorización de código en pipelines de CI: con la cuantización Q5_K_M (19,7 GB) puede integrarse en scripts de revisión automatizada que detecten patrones obsoletos y propongan cambios, siempre con revisión humana posterior.
- Agentes autónomos de resolución de tareas: las etiquetas autonomous-coding sugieren su uso en bucles de agente que planifican, escriben y verifican código de forma iterativa, aunque requiere validación externa por las limitaciones de contexto no documentadas.
- Generación de tests unitarios: el modelo puede producir casos de prueba a partir de firmas de funciones y documentación, adecuado para proyectos que necesitan cobertura rápida en fases de desarrollo.
- Chat técnico multi-turno: con la etiqueta conversational, puede emplearse como asistente de documentación técnica que mantiene contexto entre preguntas sucesivas sobre una base de código.
- Prototipado en entornos con GPU modesta: la cuantización Q2_K (11,3 GB) permite ejecutar el modelo en GPUs de 12 GB de VRAM, útil para pruebas de concepto y evaluación inicial antes de escalar a cuantizaciones mayores.
- Traducción técnica de documentación: la etiqueta multilingual permite su uso para traducir comentarios y documentación entre inglés y otros idiomas, con revisión humana por la falta de datos sobre calidad multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: 11,3 GB de pesos; requiere aproximadamente 12-13 GB de VRAM para contexto corto.
  - Q3_K_M: 13,8 GB; requiere aproximadamente 15-16 GB de VRAM.
  - Q4_K_M: 17,1 GB; requiere aproximadamente 18-20 GB de VRAM.
  - Q5_K_M: 19,7 GB; requiere aproximadamente 21-23 GB de VRAM.
  - Q6_K: 22,5 GB; requiere aproximadamente 24-26 GB de VRAM.
  - Q8_0: 29,1 GB; requiere aproximadamente 31-33 GB de VRAM.
- GPU recomendadas:
  - Consumer: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 4080 (16 GB) para Q3_K_M o IQ4_XS.
  - Profesional: A100 40 GB, A100 80 GB, H100 80 GB para Q6_K y Q8_0 con contexto amplio.
- ¿Cabe en GPU de consumo? Sí, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 12 a 24 GB; Q8_0 requiere 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en el momento de redactar esta ficha.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| RolBol Code 27B (este) | 27,3 B | no disponible | Apache 2.0 | GGUF, safetensors | Hugging Face |
| Modelos de código de ~27B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. La comparativa con alternativas de la misma categoría (asistentes de código de ~27B) no puede completarse sin datos de benchmarks ni especificaciones del modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo entrenado principalmente en inglés, es probable un sesgo hacia ese idioma, pero no se documenta.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo de código, puede producir APIs inexistentes o sintaxis inválida, por lo que requiere validación con tests.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide planificar su uso en tareas que requieran ventanas largas (repositorios completos, por ejemplo).
- Limitaciones de idioma: solo se declara inglés de forma explícita; la etiqueta multilingual no especifica qué idiomas ni con qué calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información disponible.
- Caveats para producción: las cuantizaciones son estáticas (sin imatrix), lo que puede degradar la calidad en tipos bajos como Q2_K y Q3_K_M; el autor recomienda Q4_K_S o Q4_K_M para uso rápido y Q8_0 para máxima calidad. El repositorio no incluye datos de evaluación que permitan estimar la pérdida de calidad por cuantización.
- Fecha de creación del repositorio: 2026-11-21, lo que sitúa el modelo en un marco temporal que conviene verificar antes de adoptarlo en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RolBol-Code-27B-GGUF
- Modelo base: https://huggingface.co/Rolbol07/RolBol-Code-27B
- Página de descargas del cuantizador: https://hf.tst.eu/model#RolBol-Code-27B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
