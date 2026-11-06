# sortmark/SORTMARK-DataAudit-0.5B

## Resumen

SORTMARK-DataAudit-0.5B es un modelo de lenguaje pequeno (SLM) de tipo edge, publicado por sortmark como version experimental v0.1-beta. Se construye mediante ajuste fino del modelo base Qwen/Qwen2.5-0.5B-Instruct (licencia Apache-2.0) y se distribuye empaquetado en formato GGUF con cuantizacion Q4_K_M, con un unico fichero de aproximadamente 379,38 MB. Su proposito declarado es generar informes estructurados de auditoria de cumplimiento y privacidad sobre telemetria de cadena de suministro global, orientados a perfiles como CIO, CTO, DPO, arquitectos de seguridad, ingenieros de informacion y analistas de negocio.

El modelo se posiciona como un auditor consultivo fuera de la ruta critica (non-hotpath): produce veredictos de cumplimiento y sugerencias de saneamiento en JSON estructurado que despues deben validarse con un validador de esquema determinista y revisarse por una persona. Su interes practico radica en el consumo de recursos: esta pensado para ejecucion en CPU pura, sin GPU, con menos de 500 MB de RAM, lo que permite desplegarlo en pasarelas aisladas (air-gapped) y en entornos de borde donde no es viable llamar a una API en la nube.

Con 494 millones de parametros y una ventana de contexto heredada del modelo base, no compite en capacidad de razonamiento general con modelos de mayor tamano; su valor esta en la especializacion de dominio, el formato de salida estructurado y el coste de despliegue casi nulo. El autor advierte explicitamente de que es una version beta de evaluacion y que no se recomienda su uso directo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5) |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada) |
| Idiomas soportados | en, zh, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero unico, ~379,38 MB) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Version | v0.1-beta |
| RAM en ejecucion | < 500 MB (solo CPU) |
| Checksum SHA256 | d9b6a438e4b42ea44383f30559ad45aa24c6ac8b2fb1e41108c1ec7c4a1bd46f |
| Tamano del repo | 0,4 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 494 millones de parametros. Sobre esa base, sortmark aplica un ajuste fino orientado a tareas de auditoria de datos, gobernanza de politicas y generacion de salidas JSON conformes a esquema. La model card menciona etiquetas relacionadas con DPO (dpo-governance, policy-as-code, json-schema, structured-outputs), lo que sugiere el uso de optimizacion por preferencias y entrenamiento orientado a formato estructurado, aunque no se detalla la composicion exacta del dataset, el numero de tokens de entrenamiento ni la mezcla de datos utilizada.

No se documentan innovaciones arquitectonicas propias: el modelo reutiliza el transformer estandar del base y su principal aportacion es el ajuste de comportamiento (formato de salida, dominio de cumplimiento, tono consultivo) mas el empaquetado ligero en GGUF Q4_K_M para inferencia offline en CPU. Tampoco se especifican tecnicas como decodificacion especulativa o atencion lineal. La informacion sobre el proceso de entrenamiento (hiperparametros, datos de RLHF/DPO, evaluacion intermedia) no esta disponible en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, chino y japones, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Generacion de informes de auditoria de cumplimiento de telemetria sobre nodos de cadena de suministro global.
- Sintesis de politicas de seguridad como codigo (Policy-as-Code) y reglas de microsegmentacion en formato estructurado.
- Salida estructurada conforme a JSON Schema, pensada para validacion determinista posterior.
- Identificacion de PII y recomendaciones de enmascaramiento dinamico a nivel de campo.
- Asistencia en evaluacion de cumplimiento normativo (GDPR, Data Security Law) para transitos transfronterizos.
- Veredictos de cumplimiento y sugerencias de saneamiento para revision humana (modelo consultivo, no de hotpath).
- Inferencia offline en CPU en entornos aislados, sin dependencia de GPU ni de API en la nube.
- Soporte de despliegue via Ollama y llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Auditoria de telemetria en pasarelas de borde: el modelo puede analizar cargas de telemetria de logistica transfronteriza y emitir un veredicto estructurado sobre campos sensibles, ejecutandose en la propia pasarela con menos de 500 MB de RAM y sin GPU.
- Generacion de reglas de enmascaramiento previas al transito de datos: un DPO puede usar el modelo para redactar reglas de enmascaramiento a nivel de campo antes de que los datos salgan de la jurisdiccion, y validar despues el JSON con un esquema determinista.
- Politica como codigo en seguridad zero-trust: los arquitectos de seguridad pueden obtener borradores de reglas de microsegmentacion y politicas de acceso estructuradas, que luego se revisan e integran en el pipeline de infraestructura como codigo.
- Triaje de cumplimiento en entornos air-gapped: en redes sin salida a Internet, el modelo actua como primer filtro de cumplimiento sobre registros de acceso y payloads de sincronizacion, sin exponer datos a servicios externos.
- Asistencia a analistas de negocio en flujos de comercio global: el modelo traduce flujos de transacciones comerciales complejos en informes de cumplimiento legibles, ayudando a los BA a documentar restricciones operativas y de control de acceso.
- Evaluacion de viabilidad y pruebas de arquitectura: al ser una version beta, encaja en prototipos de gateways de cumplimiento y en pruebas de concepto para medir coste total de propiedad de IA en el borde frente a soluciones en la nube.
- Generacion de informes de privacidad para comites de gobernanza: el modelo produce borradores de informes de identificacion de PII y recomendaciones de tratamiento que los equipos de gobernanza revisan antes de su aprobacion formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un script `verify_benchmark.py` para verificacion automatizada, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas de cumplimiento o generacion JSON.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo esta disenado para ejecucion en CPU.
- RAM estimada: menos de 500 MB con la cuantizacion Q4_K_M publicada (~379,38 MB de pesos).
- GPU recomendadas: no aplica; no requiere GPU. Puede ejecutarse en cualquier CPU moderna.
- Cabe en GPU consumer: si, aunque no es su objetivo; cualquier GPU con al menos ~1 GB de VRAM libre podria alojar los pesos cuantizados, pero el diseno apunta a CPU.
- Opciones de despliegue: Ollama (creacion de modelo local desde Modelfile), llama.cpp (`llama-cli` con el fichero GGUF), y contenedores estandar sobre estas herramientas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La model card solo indica ejecucion offline en CPU y ausencia de dependencias de GPU.
- Escenarios objetivo: pasarelas air-gapped, dispositivos de borde y contenedores ligeros con presupuesto de memoria muy reducido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Enfoque |
|---|---|---|---|---|---|
| SORTMARK-DataAudit-0.5B | 494M | no disponible | GGUF Q4_K_M, CPU offline | Apache-2.0 | Auditoria de cumplimiento y salida JSON estructurada |
| Qwen2.5-0.5B-Instruct | 494M | no disponible | safetensors, GGUF, multiples runtimes | Apache-2.0 | Asistente generalista multilingue |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible | safetensors, GGUF, multiples runtimes | Apache-2.0 | Asistente generalista con mayor capacidad |
| SmolLM2-360M-Instruct | 360M | no disponible | safetensors, GGUF | Apache-2.0 | SLM generalista para el borde |

La comparativa se limita a caracteristicas estructurales: no hay datos de benchmarks publicados para SORTMARK-DataAudit-0.5B que permitan contrastar rendimiento frente a estas alternativas. Frente a Qwen2.5-0.5B-Instruct, la diferencia es de especializacion (dominio de cumplimiento y formato estructurado) y de empaquetado (GGUF Q4_K_M como unica distribucion). Frente a modelos de 1,5B o mayores, pierde capacidad general pero gana en huella de memoria y despliegue en CPU.

## Limitaciones y advertencias

- Version beta experimental: el autor indica explicitamente que no se recomienda su despliegue directo en produccion y que no ofrece garantia comercial, operativa ni SLA.
- Riesgo de alucinacion: al ser un modelo de 0,5B, la probabilidad de generar reglas, veredictos o referencias normativas incorrectas es elevada; toda salida debe pasar por un validador de esquema determinista y revision humana.
- Restriccion de uso: el modelo es consultivo y no debe situarse en la ruta critica (non-hotpath) de decisiones automatizadas de cumplimiento.
- Idiomas limitados a en, zh y ja; no se documenta soporte de castellano, lo que limita su uso en entornos hispanohablantes sin evaluacion adicional.
- Longitud de contexto no documentada en la ficha; conviene verificar la del modelo base antes de disenar flujos con cargas largas.
- Sesgos conocidos: no se documentan evaluaciones de sesgo ni de robustez en la informacion proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero el estado beta y la ausencia de garantias trasladan al integrador toda la responsabilidad sobre la calidad de las salidas.
- Dependencia de validacion externa: el propio diseno asume un validador de JSON Schema y revision humana; sin ese paso, el modelo no es fiable para decisiones de cumplimiento.
- Trazabilidad limitada: no se detalla la composicion del dataset de ajuste fino, lo que dificulta auditar posibles contaminaciones o sesgos de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sortmark/SORTMARK-DataAudit-0.5B
- Portal oficial: https://sortmark.com
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
