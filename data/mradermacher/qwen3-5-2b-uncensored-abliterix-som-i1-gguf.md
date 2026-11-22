# mradermacher/Qwen3.5-2B-Uncensored-Abliterix-SOM-i1-GGUF

## Resumen

Qwen3.5-2B-Uncensored-Abliterix-SOM-i1-GGUF es una cuantizacion GGUF realizada por mradermacher sobre el modelo AkiMizuki/Qwen3.5-2B-Uncensored-Zero-Refusal-SOMA, a su vez derivado de la familia Qwen3.5 de 2B parametros de Alibaba. Se trata de una variante "abliterated" y "zero-refusal" orientada a escritura creativa, roleplay y generacion de contenido sin restricciones, con soporte multimodal de imagen segun los tags del repositorio. El modelo conserva la licencia Apache 2.0 del original.

El atractivo principal es su tamano reducido (1.881.825.088 parametros reales) combinado con un conjunto amplio de cuantizaciones i1 con imatrix, lo que permite ejecutarlo en hardware de consumo. La cuantizacion i1 utiliza matrices de importancia (imatrix) para mejorar la calidad en tamanos pequenos, con rangos desde IQ1_S (0.8 GB) hasta Q4_K_M (1.4 GB) en los ficheros listados.

Es relevante ahora porque ofrece una alternativa ligera y sin filtros para desarrolladores que necesitan un modelo pequeno para generacion creativa, agentes conversacionales o experimentacion con roleplay, en ingles y chino, con despliegue via llama.cpp u Ollama. No obstante, la ausencia de benchmarks publicados y el proceso de "abliteration" implican riesgos de calidad y seguridad que deben evaluarse antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B); multimodal segun tags (vision) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M (i1 con imatrix) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.5-2B ni del derivado AkiMizuki/Qwen3.5-2B-Uncensored-Zero-Refusal-SOMA. Por los tags y el nombre se infiere una arquitectura transformer de la familia Qwen3.5, con capacidades multimodales (tag "vision", "image") y un proceso de "abliteration" o "decensoring" que elimina el comportamiento de rechazo del modelo original. No se especifican numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF/DPO en la informacion proporcionada.

La innovacion tecnica documentada es la cuantizacion i1 con imatrix realizada por mradermacher, que genera matrices de importancia para mejorar la fidelidad de las cuantizaciones de baja precision. El repositorio incluye el fichero imatrix (0.1 GB) para que otros puedan crear sus propias cuantizaciones. Los ficheros mmproj (necesarios para la parte de vision) se alojan en el repositorio estatico asociado, no en este.

## Capacidades

- Generacion de texto conversacional y creativo en ingles y chino.
- Escritura creativa y roleplay (tags "writing", "roleplay", "rp", "rep", "r18", "ERP").
- Comportamiento "zero-refusal" / "uncensored": no aplica rechazos por contenido sensible.
- Soporte multimodal de imagen segun tags ("vision", "image"), con ficheros mmproj en el repositorio estatico.
- Uso como agente y chat (tags "agent", "chat").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se documenta soporte explicito de tool calling ni de modo "thinking" en la informacion disponible.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativa, dialogos y ficcion sin los filtros habituales, adecuado para autores que necesitan explorar temas sensibles o generos adultos.
- Roleplay conversacional: disenado para mantener personajes y conversaciones multi-turno en entornos de entretenimiento, con despliegue local via llama.cpp u Ollama.
- Prototipado de agentes ligeros: su tamano (menos de 2B parametros) y las cuantizaciones de ~1 GB permiten integrarlo en pipelines de agentes en hardware modesto para pruebas rapidas.
- Generacion de contenido en chino e ingles: util para aplicaciones bilingues que requieran generacion de texto en ambos idiomas sin depender de APIs externas.
- Experimentacion con modelos "abliterated": sirve como banco de pruebas para investigadores que estudian el efecto de eliminar el rechazo en modelos pequenos y su impacto en calidad y sesgos.
- Procesamiento de imagenes en local: con los ficheros mmproj del repositorio estatico, puede emplearse para tareas basicas de descripcion o analisis de imagenes en entornos sin conexion.
- Despliegue en dispositivos de borde: las cuantizaciones IQ2/IQ3 (0.9-1.3 GB) permiten ejecucion en portatiles o mini-PC con poca VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1-2 GB para las cuantizaciones IQ2 a Q4_K_M, mas overhead del runtime y, si se usa vision, el fichero mmproj adicional.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera alta velocidad en hardware consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Uncensored-Abliterix-SOM-i1-GGUF | 1.881.825.088 | no disponible | apache-2.0 | GGUF (i1) | Variante uncensored con vision, cuantizaciones i1 |
| Qwen3.5-2B (original) | ~2B | no disponible | apache-2.0 | safetensors | Modelo base con filtros de seguridad |
| AkiMizuki/Qwen3.5-2B-Uncensored-Zero-Refusal-SOMA | ~2B | no disponible | apache-2.0 | safetensors | Modelo base del que deriva esta cuantizacion |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de "abliteration" puede degradar la coherencia, el razonamiento y la calidad general del modelo respecto al original.
- Riesgo elevado de alucinacion, especialmente en cuantizaciones de baja precision (IQ1, IQ2) y por el tamano reducido del modelo.
- Comportamiento "zero-refusal": puede generar contenido sensible, ofensivo o inapropiado; requiere moderacion externa en produccion.
- Sesgos inheridos del dataset de entrenamiento del modelo base, no documentados en la informacion disponible.
- Soporte limitado a ingles y chino; no se garantiza calidad en castellano.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo derivado.
- Las cuantizaciones por debajo de Q3 pueden presentar perdida notable de calidad; se recomienda Q4_K_M o superior para uso serio.
- No hay benchmarks publicados que permitan validar el rendimiento real.
- Los ficheros mmproj para vision estan en el repositorio estatico, no en este; hay que descargarlos por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-2B-Uncensored-Abliterix-SOM-i1-GGUF
- Repositorio estatico (quants estaticos y mmproj): https://huggingface.co/mradermacher/Qwen3.5-2B-Uncensored-Abliterix-SOM-GGUF
- Modelo base: https://huggingface.co/AkiMizuki/Qwen3.5-2B-Uncensored-Zero-Refusal-SOMA
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-2B-Uncensored-Abliterix-SOM-i1-GGUF
- Licencia Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
