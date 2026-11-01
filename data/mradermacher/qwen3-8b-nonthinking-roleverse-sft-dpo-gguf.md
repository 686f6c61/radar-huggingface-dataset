# mradermacher/Qwen3-8B-NonThinking-RoleVerse-SFT-DPO-GGUF

## Resumen

Qwen3-8B-NonThinking-RoleVerse-SFT-DPO-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF, creado por el usuario mradermacher, del modelo tinyrolls/Qwen3-8B-NonThinking-RoleVerse-SFT-DPO. El modelo base es un ajuste fino de Qwen3 8B (en su variante sin modo de pensamiento, "non-thinking") especializado en role-playing y diálogo, entrenado mediante SFT y DPO sobre el dataset tinyrolls/RoleVerse. Su propósito es ofrecer un modelo de 8 mil millones de parámetros optimizado para conversaciones de juego de rol inmersivas, con soporte multilingüe.

La relevancia de esta ficha radica en que mradermacher no desarrolla modelos, sino que publica cuantizaciones comunitarias que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama, LM Studio u otros runtimes compatibles con GGUF. El repositorio ofrece cuantizaciones desde Q2_K (3,4 GB) hasta f16 (16,5 GB), cubriendo un amplio rango de presupuestos de VRAM. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3 8B, variante non-thinking) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no consta que sea MoE; se asume densidad completa) |
| Longitud de contexto | no disponible (la del Qwen3 base es 32.768 tokens, pero no consta en la información proporcionada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés, chino, japonés, francés, español |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base parte de Qwen3-8B en su configuración "non-thinking", es decir, sin la etapa de razonamiento explícito paso a paso que caracteriza a algunos modelos Qwen3. Esto lo hace más directo en conversación y reduce la latencia, un rasgo deseable para role-playing donde el razonamiento interno largo no aporta valor. Sobre esa base, tinyrolls realizó un entrenamiento en dos fases: primero SFT (supervised fine-tuning) sobre el dataset tinyrolls/RoleVerse y después DPO (Direct Preference Optimization) para alinear las respuestas con preferencias de calidad en diálogo y juego de rol. No se ha publicado información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni los hiperparámetros.

Esta variante concreta de mradermacher es una colección de cuantizaciones estáticas GGUF generadas mediante conversión desde los pesos safetensors del modelo original, sin cambios en la arquitectura. También existen cuantizaciones imatrix (weighted) en un repositorio paralelo del mismo autor.

## Capacidades

- Generación de texto conversacional con especialización en role-playing y diálogo de personajes
- Soporte multilingüe: inglés, chino, japonés, francés y español
- Alineación mediante DPO para respuestas preferidas en interacciones de juego de rol
- Formato GGUF compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y runtimes similares
- Pipeline conversacional (tag "conversational")
- No hay información que indique soporte de tool calling, function calling, visión, audio ni capacidades de agente

## Casos de uso

- Role-playing interactivo y narrativa de personajes: el modelo está afinado específicamente con el dataset RoleVerse para mantener coherencia de personaje en conversaciones largas, ideal para frontends como SillyTavern o KoboldCpp.
- Compañeros conversacionales en local: con la cuantización Q4_K_M (5,1 GB) cabe en una GPU de consumo de 8 GB de VRAM, permitiendo chatbots de compañía sin depender de la nube.
- Escritura creativa asistida: generación de diálogos, escenas y desarrollo de tramas en los cinco idiomas soportados, útil para guionistas y autores de ficción interactiva.
- Prototipado de juegos con NPCs dinámicos: integración en motores de juego vía llama.cpp para dotar a personajes no jugables de diálogo generado localmente con baja latencia.
- Práctica de idiomas mediante conversación inmersiva: al soportar español, francés, japonés, chino e inglés, puede usarse para simulaciones de conversación en los idiomas soportados.
- Evaluación y benchmarking de modelos afinados para role-play: al ser una cuantización completa de un modelo SFT+DPO público, sirve como referencia para comparar afinados de diálogo en hardware diverso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según la tabla de cuantizaciones del propio repositorio):
  - Q2_K: 3,4 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: 3,9 / 4,2 / 4,5 GB
  - IQ4_XS: 4,7 GB
  - Q4_K_S / Q4_K_M: 4,9 / 5,1 GB
  - Q5_K_S / Q5_K_M: 5,8 / 6,0 GB
  - Q6_K: 6,8 GB
  - Q8_0: 8,8 GB
  - f16: 16,5 GB
- GPU recomendadas: cualquier GPU de consumo con suficiente VRAM; para Q4_K_M basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 8 GB (con parte en RAM). Para Q8_0 o f16 se recomiendan RTX 4090 (24 GB) o equivalentes.
- Cabe en consumer GPU: sí, las cuantizaciones hasta Q6_K caben íntegramente en GPUs de 8-12 GB; también es ejecutable en CPU pura o modo híbrido GPU+CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui. No está orientado a vLLM ni TGI (que requieren pesos safetensors, disponibles en el modelo base).
- Latencia y throughput estimados: no disponible; al ser un modelo denso de 8B con GGUF, se esperan velocidades típicas de este rango (decenas de tokens/segundo en GPU de consumo con Q4), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Formato | Licencia |
|---|---|---|---|---|
| Qwen3-8B-NonThinking-RoleVerse-SFT-DPO (esta ficha) | 8,19B | Role-playing / diálogo (SFT+DPO) | GGUF | Apache 2.0 |
| Qwen3-8B (base, Alibaba) | 8,19B | Generalista, modo thinking/non-thinking | Safetensors, GGUF comunitario | Apache 2.0 |
| Llama-3.1-8B-Instruct | 8B | Generalista, chat | Safetensors, GGUF comunitario | Llama 3.1 Community License |
| Nous-Hermes-2-Mistral-7B-DPO | 7B | Chat generalista con DPO | Safetensors, GGUF comunitario | Apache 2.0 |

Frente al Qwen3-8B base, esta variante ofrece mejor comportamiento en role-play gracias al SFT+DPO con RoleVerse, a costa de perder el modo de razonamiento. Frente a Llama-3.1-8B-Instruct, mantiene licencia más permisiva (Apache 2.0 frente a la licencia comunitaria de Meta) y soporte nativo de chino y japonés.

## Limitaciones y advertencias

- No hay benchmarks publicados para el afinado, por lo que la calidad relativa frente a otros modelos de role-play no puede verificarse objetivamente.
- Al tratarse de un modelo especializado en role-play, es probable que su rendimiento en tareas generales (código, matemáticas, razonamiento) sea inferior al del Qwen3-8B original; no hay datos que lo cuantifiquen.
- Las cuantizaciones más agresivas (Q2_K, Q3_K_M) degradan notablemente la calidad, especialmente en idiomas distintos del inglés; se recomiendan Q4_K_M o superiores.
- El modo "non-thinking" elimina el razonamiento explícito, lo que reduce la capacidad del modelo en tareas que se benefician de cadena de pensamiento.
- Los modelos de role-play pueden generar contenido sensible o inapropiado; conviene aplicar filtros según el caso de uso y la jurisdicción.
- Riesgo de alucinación heredado del modelo base; no hay evaluaciones específicas publicadas.
- La licencia Apache 2.0 no impone restricciones de uso comercial, pero conviene revisar los términos del dataset RoleVerse, sobre el que no se aporta información de licencia en la model card.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Qwen3-8B-NonThinking-RoleVerse-SFT-DPO-GGUF
- Modelo base: https://huggingface.co/tinyrolls/Qwen3-8B-NonThinking-RoleVerse-SFT-DPO
- Cuantizaciones imatrix (weighted) del mismo autor: https://huggingface.co/mradermacher/Qwen3-8B-NonThinking-RoleVerse-SFT-DPO-i1-GGUF
- Página de descarga resumida de mradermacher: https://hf.tst.eu/model#Qwen3-8B-NonThinking-RoleVerse-SFT-DPO-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/tinyrolls/RoleVerse
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
