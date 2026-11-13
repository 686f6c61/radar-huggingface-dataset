# mradermacher/Shifaa-12k-v0.1-GGUF

## Resumen

Shifaa-12k-v0.1-GGUF es la distribucion en formato GGUF del modelo Shifaa-12k-v0.1, publicado originalmente por MustafaIbrahim y cuantizado por mradermacher para su uso con llama.cpp y entornos compatibles. Se trata de un modelo de lenguaje conversacional de aproximadamente 1.540 millones de parametros (1,543.714.304 segun los pesos safetensors del modelo base), afinado mediante aprendizaje supervisado (SFT) con TRL sobre un corpus de 12.000 ejemplos, de ahi el sufijo "12k" en el nombre. El prefijo "Shifaa" (que en arabe significa "curacion") sugiere un enfoque orientado a dominios asistenciales o de salud, aunque la model card no documenta explicitamente la composicion del dataset.

La relevancia de esta publicacion reside en que mradermacher proporciona un espectro completo de cuantizaciones estaticas (desde Q2_K hasta f16) que permiten ejecutar el modelo en hardware de consumo, desde tarjetas graficas con 4 GB de VRAM hasta sistemas con CPU y RAM convencional. El repositorio ocupa 14,2 GB en total, pero cada archivo individual pesa entre 0,8 GB (Q2_K) y 3,2 GB (f16), lo que facilita su despliegue en entornos locales sin infraestructura de servidor.

La informacion disponible sobre el modelo base es limitada: la model card del repositorio cuantizado no incluye detalles sobre la arquitectura exacta, la longitud de contexto, los datos de entrenamiento ni los resultados de evaluacion. Lo que se puede afirmar con certeza es que se trata de un transformer decoder-only de aproximadamente 1.500 millones de parametros, afinado para conversacion en ingles y distribuido bajo licencia no especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles no disponibles) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no documenta la arquitectura interna del modelo base. Por el numero de parametros (1.543.714.304) y el pipeline de transformers, se infiere que se trata de un transformer decoder-only de escala ~1.5B, similar en orden de magnitud a modelos como Qwen2-1.5B, Gemma-2B o SmolLM2-1.7B, aunque no hay confirmacion oficial de la familia arquitectonica. Los tags del repositorio indican que el modelo base fue afinado mediante TRL con SFT (supervised fine-tuning), lo que implica un entrenamiento supervisado sobre pares instruccion-respuesta, sin evidencia de etapas posteriores de RLHF o DPO.

El sufijo "12k" hace referencia al volumen del dataset de afinado (aproximadamente 12.000 ejemplos), un corpus relativamente pequeno que sugiere un ajuste especializado mas que un entrenamiento generalista a gran escala. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas ni la existencia de tecnicas adicionales como decodificacion especulativa, atencion lineal o atencion con ventana deslizante. Las cuantizaciones publicadas por mradermacher son estaticas; segun la propia model card, no se han generado variantes con imatrix o ponderadas en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a respuestas multi-turno.
- Afinado mediante SFT para seguir instrucciones en formato dialogico.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`), lo que permite desplegarlo en infraestructuras tipo Hugging Face Inference Endpoints o servidores compatibles con la API de transformers.
- Ejecucion local mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp) gracias al formato GGUF.
- Capacidad multilingue limitada al ingles segun los metadatos del repositorio.
- No hay evidencia documentada de soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistencia conversacional local en ingles: el modelo puede desplegarse en un portatil con 8 GB de RAM usando la cuantizacion Q4_K_M (1,1 GB), gestionando dialogos multi-turno sin depender de servicios en la nube. Es adecuado por su tamano reducido y su orientacion conversacional.
- Prototipado rapido de chatbots especializados: gracias al bajo coste de inferencia (1.5B parametros) y a las multiples cuantizaciones, sirve para iterar sobre prompts y flujos de conversacion antes de escalar a modelos mayores.
- Educacion y demostraciones: puede ejecutarse en entornos con GPU de consumo (GTX 1660, RTX 3060) para talleres, cursos o demos de tecnicas de cuantizacion y despliegue local.
- Filtrado y clasificacion de texto en ingles: con Q8_0 (1,7 GB) o f16 (3,2 GB) se obtiene mayor fidelidad para tareas de etiquetado, resumen o reescritura de documentos cortos.
- Generacion de respuestas en aplicaciones de escritorio: integrable en herramientas tipo Obsidian, VS Code o interfaces CLI mediante llama.cpp, aprovechando el bajo consumo de VRAM.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes del mismo modelo, lo que lo convierte en un banco de pruebas util para medir el impacto de la cuantizacion en la perplexidad y la calidad conversacional.
- Investigacion sobre SFT de bajo presupuesto: al ser un modelo afinado con ~12k ejemplos, puede servir como referencia para estudiar el efecto del volumen de datos en el rendimiento de modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,8 GB (Q2_K) y 3,2 GB (f16) solo para los pesos; anadir aproximadamente 0,5-1 GB adicional para el contexto KV cache segun la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060) para las cuantizaciones Q4 a Q8; A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas y en iGPU con memoria unificada (Apple Silicon, APUs AMD).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, vLLM (previa conversion a safetensors o uso del modelo base), TGI (con el modelo base).
- Latencia y throughput: no disponible; en una RTX 3060 con Q4_K_M es razonable esperar decenas de tokens por segundo, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Shifaa-12k-v0.1 | 1,54B | no disponible | no disponible | GGUF, safetensors | Hugging Face |
| Qwen2-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | GGUF, safetensors | Hugging Face |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | Apache 2.0 | GGUF, safetensors | Hugging Face |
| Gemma-2-2B-it | 2,61B | 8.192 tokens | Gemma Terms of Use | GGUF, safetensors | Hugging Face |

La comparativa se basa en el orden de magnitud de parametros; no hay datos de rendimiento publicados para Shifaa-12k-v0.1 que permitan una comparacion cuantitativa con estas alternativas. Qwen2-1.5B-Instruct y SmolLM2-1.7B-Instruct destacan por contextos documentados y licencias permisivas, mientras que Shifaa-12k-v0.1 carece de esa informacion en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no especificarse la composicion del dataset de SFT, no es posible evaluar sesgos de dominio, idioma o demografia.
- Riesgo de alucinacion: inherente a los modelos de 1.5B parametros afinados con datasets pequenos (~12k ejemplos); la fidelidad factual puede degradarse notablemente en dominios especializados.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- Restricciones de licencia: la licencia no esta especificada en el repositorio, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor del modelo base antes de un despliegue en produccion.
- Caveats de produccion: las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma perceptible; para produccion se recomienda Q5_K_M o superior. Las cuantizaciones imatrix no estan disponibles, por lo que no se puede aprovechar esa mejora de calidad a igual tamano.
- Trazabilidad: el repositorio cuantizado no enlaza a una model card detallada del modelo base ni a un paper o informe tecnico, lo que limita la reproducibilidad y la auditoria del entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Shifaa-12k-v0.1-GGUF
- Modelo base: https://huggingface.co/MustafaIbrahim/Shifaa-12k-v0.1
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#Shifaa-12k-v0.1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
