# mradermacher/kouman-edge-1b-GGUF

## Resumen

kouman-edge-1b-GGUF es la distribucion en formato GGUF del modelo kouman-1.0-edge-1B, desarrollado originalmente por Tree-AI-lab y cuantizado por mradermacher. Se trata de un modelo de lenguaje conversacional de aproximadamente 1.235 millones de parametros, disenado especificamente para despliegue en dispositivos de borde (edge) y moviles. Su rasgo mas distintivo es el enfoque en lenguas de Costa de Marfil, concretamente el baoule (bci) y el dioula (dyu), junto con frances e ingles, lo que lo convierte en una propuesta poco habitual dentro del ecosistema de modelos abiertos.

El modelo parte de una licencia llama3.2, lo que sugiere que su arquitectura y entrenamiento derivan de la familia Llama 3.2 de Meta, si bien no se dispone de confirmacion explicita en la informacion proporcionada. El repositorio GGUF incluye un conjunto completo de cuantizaciones estaticas que van desde Q2_K (0,7 GB) hasta f16 (2,6 GB), lo que permite ejecutarlo en hardware muy modesto, incluidos telefonos moviles o sistemas embebidos.

Su relevancia actual radica en dos factores: por un lado, la escasez de modelos abiertos que cubran lenguas minoritarias africanas con calidad conversacional; por otro, el formato GGUF y el tamano reducido lo hacen accesible para inferencia local mediante llama.cpp en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3.2, segun licencia; no confirmado explicitamente) |
| Parametros totales | 1.235.814.432 (aprox. 1,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | baoule (bci), dioula (dyu), frances (fr), ingles (en) |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la licencia llama3.2, que sugiere una base derivada de Llama 3.2. El modelo base es Tree-AI-lab/kouman-1.0-edge-1B, y la version aqui descrita es una cuantizacion estatica generada por mradermacher. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El prefijo "edge" y la etiqueta "mobile" indican que el modelo fue optimizado para inferencia en dispositivos con recursos limitados. La cuantizacion se realizo con el pipeline de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluye tanto cuantizaciones estaticas como una variante con imatrix disponible en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en baoule, dioula, frances e ingles.
- Razonamiento basico y respuesta a instrucciones en un modelo de ~1,2 B de parametros.
- Capacidades multilingues centradas en lenguas de Costa de Marfil y lenguas europeas.
- Inferencia local en dispositivos de borde y moviles gracias al formato GGUF y a las cuantizaciones de bajo bit.
- Compatibilidad con llama.cpp y ecosistemas derivados (Ollama, entre otros).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Asistentes conversacionales en lenguas locales de Costa de Marfil: el modelo puede gestionar dialogos en baoule y dioula, cubriendo un nicho practicamente desatendido por otros modelos abiertos.
- Aplicaciones moviles offline: con cuantizaciones Q4_K_M de 0,9 GB, puede integrarse en apps Android o iOS mediante llama.cpp para asistencia sin conexion.
- Traduccion asistida frances-dioula y frances-baoule: util para servicios publicos, ONG y administraciones que necesiten atender a poblacion hablante de estas lenguas.
- Educacion y alfabetizacion digital: generacion de material didactico y respuestas en lengua materna en entornos con conectividad limitada.
- Kioscos o terminales de atencion en zonas rurales: despliegue en hardware de bajo coste (Raspberry Pi, mini-PC) para consultas basicas.
- Prototipado rapido de chatbots multilingues: al ser un modelo pequeno y ligero, sirve para validar pipelines de inferencia local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~0,7 GB (Q2_K) hasta ~2,6 GB (f16), mas overhead de contexto.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. En GPU, cualquier tarjeta con 2 GB o mas de VRAM es suficiente para las cuantizaciones mas bajas.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, GTX 1650, e incluso en iGPUs y dispositivos moviles.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo API.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| kouman-edge-1b-GGUF | ~1,24 B | no disponible | bci, dyu, fr, en | llama3.2 | GGUF |
| Llama 3.2 1B | ~1,24 B | 128 K (segun Meta) | multilingue amplio | llama3.2 | safetensors, GGUF |
| Qwen2.5-1.5B | ~1,5 B | 32 K (segun Qwen) | multilingue amplio | Apache 2.0 | safetensors, GGUF |

Nota: los datos de Llama 3.2 1B y Qwen2.5-1.5B se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento directas con kouman-edge-1b en la informacion proporcionada. La ventaja diferencial de kouman es la cobertura de lenguas de Costa de Marfil, ausente en los otros.

## Limitaciones y advertencias

- Alucinacion: como todo modelo de ~1,2 B, presenta riesgo elevado de generar contenido incorrecto, especialmente en tareas de razonamiento complejo.
- Cobertura limitada: fuera de baoule, dioula, frances e ingles, el rendimiento puede degradarse notablemente.
- Sesgos: no se documentan evaluaciones de sesgo; los datos de entrenamiento podrian introducir sesgos culturales o linguisticos no caracterizados.
- Licencia llama3.2: impone restricciones de uso comercial y requiere el cumplimiento de la politica de uso aceptable de Meta. Es necesario revisar los terminos antes de un despliegue en produccion.
- Contexto: se desconoce la longitud de contexto soportada, lo que limita la planificacion de aplicaciones con ventanas largas.
- Documentacion escasa: la model card del repositorio GGUF es una plantilla generica de cuantizacion; no hay informacion sobre entrenamiento, evaluacion ni limitaciones especificas del modelo base.
- Calidad de cuantizaciones bajas: Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/kouman-edge-1b-GGUF
- Modelo base: https://huggingface.co/Tree-AI-lab/kouman-1.0-edge-1B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/kouman-edge-1b-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#kouman-edge-1b-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
