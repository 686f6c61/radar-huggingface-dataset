# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF

## Resumen

El modelo **Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF** es una cuantización GGUF del modelo homónimo en precisión completa, desarrollado por la división de investigación de Convergent Intelligence LLC. Se trata de un modelo de lenguaje denso de 0,6B parámetros (751M en total) destilado a partir del teacher **Qwen3-30B-A3B-Thinking-2507**, un modelo MoE de 30B con 3B activos, mediante un proceso de destilación de conocimiento en dos etapas: primero sobre 6.122 muestras de razonamiento STEM (matemáticas, física, etc.) con cadenas de pensamiento, y después un ajuste fino supervisado (SFT) sobre el dataset legal *Lawyer-Instruct*. El resultado es un modelo compacto que comprime 50 veces los parámetros del teacher y que, en su cuantización Q4_K_M, alcanza una reducción de ~75 veces, lo que permite ejecutarlo en dispositivos de borde como teléfonos móviles o incluso relojes inteligentes.

La relevancia de este modelo radica en su enfoque de destilación con énfasis en razonamiento estructurado (pruebas matemáticas, cadenas de pensamiento) y su posterior capa de razonamiento legal, todo ello en un paquete de menos de 500 MB. Está pensado para entornos con recursos muy limitados donde se necesita una capacidad de razonamiento básica sin depender de la nube. Su licencia Apache 2.0 permite uso comercial sin restricciones, y al estar en formato GGUF es compatible con llama.cpp, Ollama y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (basado en Qwen3-0.6B) |
| Parametros totales | 751.632.384 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se construye en dos etapas sobre la arquitectura base **Qwen3-0.6B**, un transformer decoder-only denso. La primera etapa consiste en una destilacion de conocimiento desde el teacher **Qwen3-30B-A3B-Thinking-2507** (un modelo MoE con 30B de parametros totales y 3B activos). Sobre 6.122 muestras de cadenas de pensamiento STEM, se aplica una perdida de entropia cruzada ponderada por prueba (con un factor 2.5x que decae a 1.5x en los tokens de derivacion) combinada con divergencia KL a temperatura T=2.0. Esta estrategia transfiere al estudiante las trazas de razonamiento extendido y la estructura deliberativa del teacher, capturando la "topologia" del conocimiento mediante tecnicas propias de la compania (Discrepancy Calculus, Topological Knowledge Distillation).

La segunda etapa aplica un ajuste fino supervisado (SFT) sobre el dataset **Alignment-Lab-AI/Lawyer-Instruct** con una tasa de aprendizaje conservadora de 5e-6, para anadir una capa de razonamiento legal sin sobrescribir el nucleo STEM ya aprendido. El resultado es un modelo hibrido que combina capacidad de derivacion matematica con nociones juridicas basicas. La cuantizacion GGUF posterior preserva las fronteras estructurales detectadas durante la destilacion, segun afirma el autor, ya que estan "horneadas" en los pesos y no dependen de la precision numerica.

## Capacidades

- Generacion de texto en ingles con instrucciones estructuradas (formato `### Instruction` / `### Response`).
- Razonamiento matematico y cientifico (STEM): demostraciones, derivaciones y problemas de fisica, con cadenas de pensamiento.
- Razonamiento legal basico: conceptos generales como "promissory estoppel", diferencias entre delitos graves y menores, etc.
- Capacidad de seguir instrucciones de formato para tareas de texto generico.
- Soporte de ejecucion local en CPU y GPU de baja potencia gracias a las cuantizaciones GGUF.
- No se menciona soporte de tool calling, agentes, vision, audio ni multilingue (solo ingles).

## Casos de uso

- **Asistente de estudio STEM en movil**: un estudiante puede consultar demostraciones de teoremas o resolver problemas de fisica desde un telefono de gama media, sin conexion a internet. El modelo genera cadenas de razonamiento paso a paso gracias a su entrenamiento con pruebas ponderadas.
- **Tutor legal basico para ciudadanos**: responder preguntas generales sobre conceptos juridicos (diferencias entre tipos de delitos, terminologia legal) en una app de asistencia, con la advertencia de que no sustituye a un abogado.
- **Generacion de contenido educativo**: crear explicaciones breves de conceptos STEM o legales para plataformas de e-learning, aprovechando el formato de instruccion y la capacidad de razonamiento.
- **Procesamiento de texto en dispositivos IoT**: integrar el modelo en un asistente de voz o chat para dispositivos de borde (relojes, altavoces) donde el modelo Q4_K_M de ~400 MB cabe en memoria flash.
- **Prototipado rapido de aplicaciones de razonamiento**: desarrolladores que necesitan validar flujos de chain-of-thought en entornos sin GPU pueden usar este modelo como sustituto ligero de modelos grandes, gracias a su compatibilidad con llama.cpp y Ollama.
- **Analisis de documentos legales sencillos**: extraer conceptos clave o resumir clausulas basicas en ingles, aunque con limitaciones de matiz y profundidad, segun advierte el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. El autor solo menciona limitaciones cualitativas (errores en pruebas de mas de ~8 pasos, razonamiento legal sin matices) pero no aporta numeros.

## Requisitos de hardware

- **F16** (~1,3 GB): requiere ~1,5 GB de VRAM o RAM. Adecuado para desktop/laptop con al menos 4 GB de RAM.
- **Q8_0** (~700 MB): requiere ~1 GB de RAM/VRAM. Funciona en portatiles y mini-PCs.
- **Q5_K_M** (~500 MB): recomendado para moviles; cabe en la RAM de cualquier smartphone moderno (2 GB o mas).
- **Q4_K_M** (~400 MB): optimo para IoT, smartwatches y dispositivos con menos de 1 GB de RAM disponible.
- **GPU**: no requiere GPU dedicada; puede ejecutarse en CPU con llama.cpp. En GPU, cualquier tarjeta con 1 GB de VRAM (ej. Raspberry Pi con acelerador, GPUs integradas) es suficiente.
- **Opciones de despliegue**: llama.cpp (CLI y Python), Ollama (creando un Modelfile), LM Studio (carga directa del GGUF), y cualquier runtime compatible con GGUF.
- **Latencia**: no hay datos oficiales, pero al ser un modelo de 0,6B, la generacion es rapida incluso en CPU; en un telefono moderno se esperan decenas de tokens por segundo con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| **Qwen3-0.6B (base)** | 0,6B | 32K (segun documentacion de Qwen) | Apache 2.0 | safetensors | Modelo original sin destilacion; razonamiento generico |
| **Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF** (este) | 0,6B (751M) | No disponible | Apache 2.0 | GGUF | Destilado con foco en STEM y legal; cuantizado para edge |
| **Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF** (variante mayor) | 1,7B | No disponible | Apache 2.0 | GGUF | Misma familia, mayor capacidad, mayor tamano de archivo |

La comparativa con otros modelos de 0,6B no esta disponible en la informacion proporcionada. Se puede afirmar que este modelo es una version especializada de Qwen3-0.6B, con mejor rendimiento en razonamiento STEM y legal gracias a la destilacion, pero con la limitacion de estar enfocado solo a ingles.

## Limitaciones y advertencias

- **Capacidad limitada**: al ser un modelo de 0,6B, comete errores que modelos mayores evitan. Las demostraciones de mas de ~8 pasos tienden a degradarse.
- **Razonamiento legal superficial**: cubre conceptos generales pero carece de matices, jurisprudencia o precision profesional. No debe usarse como sustituto de asesoria legal.
- **Alucinaciones**: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en dominios especializados. Se recomienda verificar siempre las salidas criticas.
- **Idioma**: solo soporta ingles. No hay capacidad multilingue.
- **Contexto**: la longitud de contexto no esta documentada en el repo; se asume que hereda la del modelo base Qwen3-0.6B (32K), pero no esta confirmado.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantias de exactitud ni soporte.
- **Dependencia de la cuantizacion**: aunque el autor afirma que la destilacion preserva las fronteras estructurales, las cuantizaciones agresivas (Q4_K_M) pueden introducir degradacion adicional en tareas de razonamiento complejo.

## Enlaces

- Repositorio GGUF: [https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF](https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF)
- Modelo base en precision completa: [https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT](https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT)
- Teacher (modelo original): [https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507](https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507)
- Dataset de SFT legal: [https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct](https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct)
- Sitio web del desarrollador: [https://convergentintel.com](https://convergentintel.com)
- Variante mayor (1.7B): [https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF](https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF)
