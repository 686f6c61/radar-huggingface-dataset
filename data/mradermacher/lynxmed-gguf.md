# mradermacher/LynxMed-GGUF

## Resumen

LynxMed-GGUF es la version cuantizada en formato GGUF del modelo LynxMed, desarrollado originalmente por el usuario harishussain12 y convertido a GGUF por mradermacher, un conocido colaborador de la comunidad que publica cuantizaciones estaticas de modelos abiertos. El modelo base cuenta con 120.514.560 parametros (aproximadamente 120 millones), lo que lo situa en la categoria de modelos pequenos, adecuados para despliegue en hardware modesto y escenarios de inferencia en el borde.

El modelo esta etiquetado como especializado en el ambito medico (por el nombre "LynxMed") y entrenado exclusivamente en ingles. Al tratarse de una cuantizacion, este repositorio no aporta informacion sobre arquitectura, datos de entrenamiento o metodologia de alineacion; toda la informacion tecnica relevante reside en el modelo base. La relevancia de esta publicacion radica en que permite ejecutar el modelo en CPU o GPUs de consumo mediante llama.cpp y herramientas compatibles, con un peso que va desde 0,2 GB en cuantizaciones bajas hasta 0,3 GB en f16.

La licencia no esta especificada en la informacion disponible, lo que constituye un factor critico antes de cualquier uso comercial. El modelo se distribuye en doce variantes de cuantizacion estatica (Q2_K a f16), sin cuantizaciones ponderadas ni imatrix publicadas por el autor en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 120.514.560 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base LynxMed en la documentacion proporcionada. Por el numero de parametros (120 millones) y la libreria declarada (transformers), es plausible que se trate de un transformer decoder-only de escala reducida, pero este extremo no esta confirmado en la informacion disponible. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

La unica innovacion tecnica documentada en este repositorio es el proceso de cuantizacion estatica realizado por mradermacher, con la nota de que las cuantizaciones ponderadas o imatrix no estaban disponibles en el momento de la publicacion. El autor indica que, si no aparecen en la semana siguiente a las estaticas, probablemente no las tenga planificadas, aunque acepta peticiones via Community Discussion.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente para el idioma ingles.
- Dominio medico: el nombre del modelo sugiere un ajuste orientado a contenido clinico o biomedico, aunque no se documentan las tareas concretas.
- Inferencia local: al estar en formato GGUF, es compatible con llama.cpp y derivados (Ollama, LM Studio, entre otros).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; solo ingles.
- No se documentan capacidades especiales adicionales.

## Casos de uso

- Prototipado de asistentes clinicos en local: dado su tamano reducido (0,2 GB en Q4_K_M), permite iterar rapidamente en un portatil sin GPU dedicada para validar flujos de preguntas y respuestas sobre terminologia medica en ingles.
- Despliegue en dispositivos con recursos limitados: su huella de memoria permite ejecutarlo en Raspberry Pi, telefonos de gama alta o navegadores mediante WebAssembly con llama.cpp, util para demos offline.
- Filtrado y clasificacion de textos biomedicos: puede emplearse como clasificador ligero o generador de resumenes preliminares en pipelines de preprocesado, donde el coste por token es minimo.
- Educacion y formacion: util como modelo de demostracion en cursos sobre cuantizacion GGUF y despliegue de LLM, ya que el repositorio incluye doce variantes para comparar calidad y tamano.
- Pruebas de regresion en pipelines de CI: al ser tan ligero, puede integrarse en tests automatizados que verifiquen el correcto funcionamiento de una cadena de inferencia sin consumir recursos significativos.
- Investigacion sobre cuantizacion: sirve como caso de estudio para medir la degradacion de calidad entre Q2_K y f16 en un modelo pequeno de dominio especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; aproximadamente 0,2 GB para Q4_K_M y 0,3 GB para f16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090, e incluso en iGPU y SoC tipo Apple Silicon.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles; por el tamano, se espera inferencia en tiempo real incluso en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LynxMed-GGUF | 120,5 M | no disponible | no disponible | GGUF | Especializado en dominio medico (por nombre), solo ingles |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Modelo generalista, ~9x mas grande |
| Qwen2.5-0.5B | 0,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo generalista multilingue, contexto largo |
| SmolLM-135M | 135 M | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Modelo generalista, tamano comparable |

La comparativa es orientativa: no se dispone de datos de rendimiento de LynxMed que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Licencia no especificada: no es posible determinar si el uso comercial esta permitido; debe consultarse el modelo base antes de cualquier despliegue en produccion.
- Modelo de dominio medico: cualquier salida debe tratarse como no validada clinicamente y no sustituye el criterio de un profesional sanitario.
- Riesgo de alucinacion elevado: con 120 millones de parametros, la capacidad de razonamiento y la fidelidad factual son limitadas en comparacion con modelos de mayor escala.
- Solo ingles: no soporta castellano ni otros idiomas, lo que restringe su uso en el mercado hispanohablante.
- Contexto desconocido: se desconoce la longitud maxima de contexto, lo que impide garantizar conversaciones multi-turno largas.
- Ausencia de cuantizaciones imatrix: las versiones publicadas son estaticas, con la consiguiente perdida de calidad frente a cuantizaciones ponderadas en los niveles bajos (Q2_K, Q3_K).
- Sin datos de benchmarks ni evaluacion independiente: no hay evidencia publica de su calidad frente a alternativas.
- Repositorio de cuantizacion: los problemas del modelo deben reportarse contra el modelo base harishussain12/LynxMed, no contra este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LynxMed-GGUF
- Modelo base: https://huggingface.co/harishussain12/LynxMed
- Pagina de descargas del autor: https://hf.tst.eu/model#LynxMed-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos: https://huggingface.co/mradermacher/model_requests
