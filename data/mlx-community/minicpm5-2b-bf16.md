# mlx-community/MiniCPM5-2B-bf16

## Resumen

MiniCPM5-2B-bf16 es la conversion a formato MLX del modelo openbmb/MiniCPM5-2B, publicada por la comunidad mlx-community. Se trata de un modelo de generacion de texto denso de aproximadamente 2.520 millones de parametros (2.516.756.480 segun los pesos safetensors), orientado a ejecucion en dispositivo (on-device) y entornos de borde, con soporte declarado de contexto largo y de llamada a herramientas. La conversion se realizo con mlx-lm 0.31.3 en precision bf16 sin cuantizar, lo que preserva la fidelidad numerica respecto al modelo original de OpenBMB.

El modelo hereda la arquitectura tipo Llama indicada en las etiquetas del repositorio y esta entrenado principalmente para ingles y chino. Su relevancia actual radica en que permite desplegar un modelo de ~2,5 B de parametros sobre hardware Apple Silicon mediante el framework MLX, sin necesidad de GPU Nvidia ni de servicios en la nube, un escenario cada vez mas demandado para asistentes locales, agentes y prototipado rapido.

Esta ficha describe la version bf16 alojada por mlx-community. El modelo base y su model card original pertenecen a OpenBMB, por lo que los detalles de entrenamiento, composicion del dataset y resultados de evaluacion solo pueden confirmarse consultando dicha fuente; cualquier dato no presente en la informacion disponible se marca como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (segun etiqueta del repositorio) |
| Parametros totales | 2.516.756.480 (~2,52 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el repositorio declara la etiqueta "long-context", pero no especifica el numero de tokens) |
| Tipos de cuantizacion | este repositorio se distribuye en bf16 sin cuantizar; MLX permite cuantizacion posterior (por ejemplo 8, 6 o 4 bits) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo emplea una arquitectura transformer basada en Llama, con aproximadamente 2,52 B de parametros densos y sin mezcla de expertos. La conversion a MLX se realizo con mlx-lm 0.31.3 en bf16, es decir, preservando los pesos originales sin cuantizar. No se dispone en los datos proporcionados de detalles sobre el numero exacto de capas, dimensiones de atencion, tipo de posicional encoding ni si incorpora atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, las etiquetas del repositorio enumeran los datasets utilizados por el modelo base: openbmb/Ultra-FineWeb, openbmb/UltraX-Preview y openbmb/Ultra-FineWeb-L3 para preentrenamiento; openbmb/UltraData-Math y openbmb/UltraData-Code para datos de matematicas y codigo; y openbmb/UltraData-SFT-2605, openbmb/UltraData-SFT-Agent-2609 y openbmb/UltraData-RL-2609 para las fases de ajuste supervisado, agentes y aprendizaje por refuerzo. Esto sugiere un pipeline que incluye SFT y RL, aunque no se especifican el numero de tokens, la composicion exacta de las mezclas ni los hiperparametros en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Soporte declarado de contexto largo, segun la etiqueta "long-context" del repositorio (sin cifra concreta disponible).
- Soporte declarado de tool calling / function calling, segun la etiqueta "tool-calling".
- Capacidades orientadas a agentes, coherentes con la inclusion del dataset UltraData-SFT-Agent-2609.
- Razonamiento matematico y generacion de codigo, inferidos de la presencia de UltraData-Math y UltraData-Code en el pipeline de datos.
- Optimizado para ejecucion en dispositivo (etiquetas "on-device" y "edge-ai").
- Integracion con el ecosistema MLX mediante mlx-lm, con chat template disponible en el tokenizer.

## Casos de uso

- Asistentes locales en macOS: al ejecutarse sobre MLX en Apple Silicon, el modelo puede ofrecer generacion de texto y conversacion multi-turno sin conexion a internet, lo que resulta util para aplicaciones de productividad que requieren privacidad de datos.
- Agentes con llamada a herramientas: gracias al soporte declarado de tool calling, puede integrarse en flujos donde el modelo invoca funciones externas (APIs, busquedas, calculos) en pipelines de automatizacion.
- Prototipado rapido en portatiles: con ~5 GB en bf16, cabe en la memoria unificada de un Mac moderno, permitiendo experimentar con fine-tuning ligero o evaluacion sin infraestructura de GPU.
- Generacion de codigo asistida: los datos de entrenamiento incluyen UltraData-Code, por lo que puede emplearse como autocompletado o asistente de programacion en editores locales.
- Resolucion de problemas matematicos paso a paso: la presencia de UltraData-Math sugiere utilidad en tareas de razonamiento cuantitativo y tutoria educativa.
- Chatbot multilingue en ingles y chino: adecuado para aplicaciones de atencion al cliente en mercados angloparlantes y sinofonos, sin necesidad de traduccion intermedia.
- Preprocesamiento y resumen de documentos: su etiqueta de contexto largo permite resumir o extraer informacion de textos extensos en tareas de back-office.
- Base para fine-tuning especifico de dominio: al ser un modelo de 2,5 B con licencia Apache 2.0, sirve como punto de partida para ajustes personalizados con coste computacional reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada en bf16: aproximadamente 5,0-5,5 GB para los pesos, mas el overhead del runtime y la cache KV (el repositorio ocupa 5,0 GB).
- VRAM/RAM estimada en cuantizacion 8 bits: en torno a 2,7-3,0 GB.
- VRAM/RAM estimada en cuantizacion 4 bits: en torno a 1,5-2,0 GB.
- GPU compatibles: al tratarse de un modelo en formato MLX, el destino principal es hardware Apple Silicon (familias M1, M2, M3, M4 y superiores) con memoria unificada. No se distribuyen pesos GGUF ni safetensors estandar en este repositorio, por lo que su uso directo en GPU Nvidia o AMD no esta soportado tal cual.
- Cabe en GPU de consumo: si cabe en iGPU integradas de Apple Silicon con al menos 8 GB de memoria unificada, especialmente en cuantizaciones de 8 o 4 bits. No se confirma disponibilidad de pesos para GPUs de consumo Nvidia en este repositorio.
- Opciones de despliegue: mlx-lm (referencia oficial del repositorio). Para otras plataformas habria que recurrir a la conversion del modelo base openbmb/MiniCPM5-2B a llama.cpp, vLLM, TGI u Ollama, conversiones que no se incluyen aqui.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion se limita a datos verificables de especificaciones; el rendimiento de MiniCPM5-2B no puede contrastarse al no publicarse benchmarks en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Formato en este repositorio |
|---|---|---|---|---|
| MiniCPM5-2B-bf16 (mlx-community) | ~2,52 B | no disponible | apache-2.0 | MLX safetensors bf16 |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | apache-2.0 | safetensors original |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | safetensors original |
| Gemma-2-2B-it | ~2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors original |

Nota: los datos de contexto y licencia de los modelos comparados son los publicados habitualmente por sus autores; el rendimiento relativo no puede evaluarse sin benchmarks de MiniCPM5-2B.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al entrenarse con datasets web de gran escala (Ultra-FineWeb y derivados), es probable que herede sesgos de dichas fuentes, pero no se documentan analisis especificos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se aportan metricas de fidelidad factual.
- Limitaciones de contexto e idioma: solo se declaran ingles y chino. No hay soporte confirmado de castellano, por lo que su uso en espanol puede degradar la calidad. La longitud de contexto no esta cuantificada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y atribucion correspondiente. Conviene verificar tambien los terminos del modelo base openbmb/MiniCPM5-2B.
- Ambito de plataforma: este repositorio concreto es un artefacto MLX; no es directamente utilizable fuera del ecosistema Apple MLX sin convertir los pesos.
- Datos de evaluacion ausentes: sin benchmarks publicados, no es posible garantizar su comportamiento frente a modelos de tamano comparable en tareas de razonamiento, codigo o matemticas.
- Madurez del repositorio: cuenta con 0 descargas y 0 likes en el momento de la consulta, lo que no aporta evidencia de validacion comunitaria.

## Enlaces

- Repositorio HuggingFace (version MLX bf16): https://huggingface.co/mlx-community/MiniCPM5-2B-bf16
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Libreria MLX LM: https://github.com/ml-explore/mlx-lm
- Framework MLX: https://github.com/ml-explore/mlx
- Datasets de referencia: https://huggingface.co/openbmb/Ultra-FineWeb ; https://huggingface.co/openbmb/UltraX-Preview ; https://huggingface.co/openbmb/Ultra-FineWeb-L3 ; https://huggingface.co/openbmb/UltraData-Math ; https://huggingface.co/openbmb/UltraData-Code ; https://huggingface.co/openbmb/UltraData-SFT-2605 ; https://huggingface.co/openbmb/UltraData-SFT-Agent-2609 ; https://huggingface.co/openbmb/UltraData-RL-2609
