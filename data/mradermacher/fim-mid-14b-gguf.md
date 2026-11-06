# mradermacher/FIM-Mid-14B-GGUF

## Resumen

FIM-Mid-14B-GGUF es la distribucion en formato GGUF del modelo TIGER-Lab/FIM-Mid-14B, un modelo de lenguaje de 14.770.033.664 parametros (~14,77 mil millones) especializado en generacion de codigo y tareas de software engineering mediante Fill-In-the-Middle (FIM). Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, que genera versiones estaticas en GGUF del modelo original de TIGER-Lab para su uso en herramientas de inferencia local como llama.cpp u Ollama.

El modelo esta afinado sobre el dataset TIGER-Lab/FIM-Midtraining-400K y esta disenado especificamente para completar codigo en medio de un contexto (FIM), una capacidad clave para asistentes de autocompletado en editores e IDEs. La ficha documenta exclusivamente la version cuantizada; el modelo base y sus detalles de entrenamiento deben consultarse en el repositorio original de TIGER-Lab.

La relevancia actual radica en que ofrece una alternativa de 14B parametros con licencia Apache 2.0, ejecutable en hardware de consumo mediante cuantizaciones de 4 bits (Q4_K_M de 9,1 GB), lo que la hace accesible para integracion en entornos de desarrollo locales y pipelines de CI/CD sin dependencia de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; detalles no especificados en la informacion) |
| Parametros totales | 14.770.033.664 (~14,77 B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, x-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base TIGER-Lab/FIM-Mid-14B en la informacion proporcionada. Por el nombre y el tamano (14,77 B de parametros) se trata presumiblemente de un transformer denso de aproximadamente 14B parametros, pero la model card del repositorio cuantizado no especifica capas, dimensiones ni tipo de atencion.

El modelo esta afinado sobre el dataset TIGER-Lab/FIM-Midtraining-400K, orientado a tareas de Fill-In-the-Middle (FIM) y software engineering. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. Para estos datos debe consultarse el repositorio del modelo base.

## Capacidades

- Generacion y completado de codigo en modo Fill-In-the-Middle (FIM): completa fragmentos de codigo entre un prefijo y un sufijo, capacidad central del modelo.
- Tareas de software engineering: el modelo esta afinado especificamente para este dominio.
- Generacion de texto conversacional (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: solo ingles (`en`) segun los metadatos.
- Capacidades especiales (thinking mode, vision, audio): no documentadas.

## Casos de uso

- Autocompletado en editores e IDEs: el modelo completa codigo entre cursor y sufijo gracias a su entrenamiento FIM, integrandose en plugins de VS Code, Neovim o JetBrains mediante un servidor local con llama.cpp.
- Asistente de refactorizacion local: permite reescribir funciones completas a partir de su contexto anterior y posterior, util para tareas de migracion de codigo sin enviar el codigo a servicios externos.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede completar el cuerpo de pruebas en el mismo fichero o en uno nuevo, aprovechando el contexto del proyecto.
- Pipelines de CI/CD con revision de codigo: al ser Apache 2.0 y ejecutable localmente, puede desplegarse en runners para sugerir parches o completar plantillas de configuracion.
- Entornos con requisitos de privacidad: al ejecutarse en hardware propio con cuantizacion Q4_K_M (9,1 GB), permite completar codigo propietario sin salida de datos a la nube.
- Prototipado de herramientas de developer tooling: sirve como base para construir asistentes de codigo personalizados o experimentar con tecnicas FIM en investigacion.
- Completado de documentacion tecnica y fragmentos de configuracion (YAML, JSON) en ingles, dado el soporte limitado a ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion del repositorio):
  - Q2_K: 5,9 GB
  - Q3_K_M: 7,4 GB
  - IQ4_XS: 8,3 GB
  - Q4_K_S: 8,7 GB (recomendada, rapida)
  - Q4_K_M: 9,1 GB (recomendada, rapida)
  - Q5_K_M: 10,6 GB
  - Q6_K: 12,2 GB
  - Q8_0: 15,8 GB
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) puede ejecutar Q8_0 con holgura y Q4_K_M con margen amplio; una RTX 3090 o 4080 (16-24 GB) cubre Q6_K y Q8_0; GPUs de 8-12 GB pueden ejecutar Q4_K_S o Q4_K_M con offload parcial.
- Cabe en GPU de consumo: si, con cuantizaciones Q4 o inferiores en GPUs de 8 GB o mas; Q6_K y Q8_0 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo base admite transformers/vLLM/TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos en la informacion proporcionada. Como referencia estructural, el modelo base comparte categoria (14B, licencia Apache 2.0, orientado a codigo/FIM) con otros modelos de completado de codigo de tamano similar, pero no se aportan cifras de rendimiento que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FIM-Mid-14B (este) | ~14,77 B | no disponible | Apache 2.0 | GGUF / safetensors | Especializado en FIM y software engineering |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion |

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles (`en`); el rendimiento en castellano no esta garantizado ni documentado.
- Sesgos: no se documentan sesgos conocidos en la model card; al ser un modelo de codigo, puede reproducir patrones y practicas presentes en los datos de entrenamiento.
- Alucinacion: riesgo inherente en modelos generativos; en codigo puede producir APIs o funciones inexistentes, por lo que requiere validacion.
- Contexto: la longitud de contexto no esta especificada, lo que impide planificar su uso en ficheros muy grandes.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base TIGER-Lab/FIM-Mid-14B por si hubiera restricciones adicionales.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M degradan la calidad segun las notas del propio autor; para produccion se recomienda Q4_K_M o superior.
- Falta de imatrix: el autor indica que las cuantizaciones ponderadas/imatrix no estan disponibles en el momento de la publicacion.
- Es una cuantizacion de terceros: la responsabilidad sobre el comportamiento del modelo recae en el modelo base; este repositorio solo redistribuye pesos convertidos.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/FIM-Mid-14B-GGUF
- Modelo base: https://huggingface.co/TIGER-Lab/FIM-Mid-14B
- Dataset de entrenamiento: https://huggingface.co/datasets/TIGER-Lab/FIM-Midtraining-400K
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#FIM-Mid-14B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes del cuantizador: https://huggingface.co/mradermacher/model_requests
