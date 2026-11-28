# masahiroid/roberta-base-go_emotions-gguf

## Resumen

`masahiroid/roberta-base-go_emotions-gguf` es una conversion al formato GGUF del clasificador de emociones `SamLowe/roberta-base-go_emotions`, un modelo basado en RoBERTa-base (124,7 millones de parametros) entrenado para clasificar texto en ingles en 28 categorias emocionales mediante activacion sigmoide independiente, de modo que varias emociones pueden aplicarse simultaneamente a un mismo texto. El autor de la conversion es el usuario de Hugging Face `masahiroid`, que no ha reentrenado ni modificado los pesos: se trata de una conversion de checkpoint con paridad numerica verificada frente a la implementacion original en PyTorch.

La relevancia de esta ficha es acotada y conviene dejarla clara desde el principio: el artefacto no es un GGUF compatible con llama.cpp, Ollama o LM Studio. El autor define un esquema propio (`general.architecture=hf-native-mlx-v1`) que conserva los nombres de tensor originales de Hugging Face en precision F32 y requiere un cargador MLX incluido en el propio repositorio, ademas de hardware Apple Silicon. No es una cuantizacion de 4 bits pese a la etiqueta GGUF, y no incorpora ninguna capacidad generativa: es un encoder de clasificacion, no un modelo de lenguaje causal.

Por tanto, su interes practico esta en desplegar el clasificador de emociones en el ecosistema Apple (MLX, Core ML, Core AI) con pesos verificados numericamente, no en sustituir a un LLM. Para cualquier uso fuera de macOS con Apple Silicon, la recomendacion tecnica es acudir al checkpoint original en Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (transformer encoder, solo codificador) |
| Parametros totales | 124.667.164 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | la del modelo base (maximo original preservado; no se especifica la cifra exacta en la informacion disponible) |
| Tipos de cuantizacion | F32 (el autor indica explicitamente que no es una cuantizacion de 4 bits); exportaciones Core ML/Core AI con batch 1 y longitud de secuencia fija de 128 |
| Idiomas soportados | ingles (entrenado para clasificacion de emociones en ingles; las pruebas de validacion incluyen un caso en japones sin garantia de calidad) |
| Licencia | MIT (pesos); el conversor y el runtime anaden licencia MIT propia (`CODE_LICENSE`) |
| Formato de pesos | GGUF con esquema custom `hf-native-mlx-v1` (no compatible con llama.cpp/Ollama/LM Studio); tambien MLX, Core ML y Core AI en repos separados |

## Arquitectura y entrenamiento

La arquitectura subyacente es RoBERTa-base, un transformer encoder con 124,7 millones de parametros y cabecera de clasificacion multi-etiqueta sobre 28 emociones (activacion sigmoide independiente por clase, no softmax). El modelo original fue entrenado por SamLowe sobre el dataset GoEmotions de Google Research; esta conversion no anade entrenamiento, fine-tuning ni reemplazo de checkpoint: parte de la revision `d75048347613a25d77de8cf6412eaae9fa7b26be` del modelo base y preserva todos los tensores usados por la inferencia original.

La innovacion tecnica del artefacto no esta en el modelo sino en el empaquetado: un contenedor GGUF con nombres de tensor nativos de Hugging Face y precision F32, pensado para un runtime MLX propio. La validacion numerica reportada por el autor cubre 6 casos deterministas con una diferencia absoluta maxima de 2,9802322e-05 y una similitud coseno minima de 0,9999999 frente a la implementacion PyTorch. Los casos incluyen emociones en ingles, texto neutro de recuperacion, japones, entrada vacia y truncamiento. El autor advierte que son comprobaciones de paridad de conversion, no benchmarks de calidad de tarea ni de latencia. El entorno de conversion documentado es PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, NumPy 1.26.4, coremltools 9.0 y GGUF 0.19.0.

## Capacidades

- Clasificacion multi-etiqueta de emociones en ingles con 28 categorias y puntuaciones sigmoide independientes (varias emociones pueden activarse a la vez).
- Salida de logits por clase; el usuario aplica sigmoide y umbral (el ejemplo del autor usa 0,5) para obtener las etiquetas activas.
- Procesamiento de entradas de longitud variable hasta el limite del modelo base mediante el runtime MLX incluido.
- Exportaciones adicionales con formas fijas (batch 1, secuencia 128) para Core ML y Core AI, orientadas a despliegue en el ecosistema Apple.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision ni audio: es exclusivamente un encoder de clasificacion.
- Capacidad multilingue no garantizada: solo el ingles esta declarado como idioma de entrenamiento; el japones aparece unicamente como caso de prueba de conversion.

## Casos de uso

- Moderacion de comunidades y redes sociales: clasificar comentarios en ingles con las 28 etiquetas para detectar enfado, disgusto o desaprobacion y enrutar automaticamente a revision humana, aprovechando que las puntuaciones sigmoide permiten combinar emociones en un mismo mensaje.
- Analisis de sentimiento a nivel de emocion en encuestas de satisfaccion: procesar respuestas abiertas en ingles y agregar la distribucion de emociones por segmento de cliente, con un coste de inferencia muy bajo al ser un modelo de 124 millones de parametros.
- Enrutamiento de tickets de soporte: usar la emocion dominante (frustracion, decepcion, gratitud) como senal adicional para priorizar colas o escalar casos, integrándolo como paso previo a un LLM generativo que redacte la respuesta.
- Investigacion en psicologia computacional y linguistica: etiquetar corpus en ingles con el esquema GoEmotions para estudios reproducibles, con la ventaja de disponer de pesos F32 verificados numericamente frente al checkpoint original.
- Monitorizacion de reputacion de marca: analisis por lotes de menciones y resenas en ingles para detectar picos de emociones negativas y correlacionarlos con eventos de producto.
- Prototipado en macOS con Apple Silicon: validar pipelines de clasificacion de emociones en local con MLX antes de mover el sistema a produccion con Transformers o servicios gestionados, usando el runtime incluido en el repositorio.
- Preprocesado de datasets para entrenamiento: generar etiquetas emocionales auxiliares en corpus en ingles que alimenten modelos mayores o sistemas de recomendacion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (F1, precision, recall por emocion) en la informacion disponible. El autor solo reporta pruebas de paridad de conversion frente a PyTorch:

| Metrica | Valor |
|---|---|
| Casos de validacion deterministas | 6 |
| Diferencia absoluta maxima frente a PyTorch | 2,9802322e-05 |
| Similitud coseno minima | 0,9999999 |
| Benchmark de latencia o throughput | no disponible |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 0,5 GB en F32; en Apple Silicon la inferencia MLX requiere memoria unificada suficiente para cargar los tensores F32 y el tokenizador, del orden de 1 GB o menos en la practica.
- Plataforma obligatoria: macOS con Apple Silicon (el runtime MLX incluido lo exige explicitamente).
- GPU dedicadas (A100, H100, RTX 4090): no aplica para este artefacto; para CUDA debe usarse el checkpoint original en Transformers.
- GPU de consumo: cualquier Mac con chip Apple Silicon deberia poder ejecutarlo por el reducido tamano del modelo; no hay datos de latencia publicados.
- Opciones de despliegue: runtime MLX propio del repositorio (`runtime_mlx.Model`), exportaciones Core ML y Core AI en repos separados; no es compatible con vLLM, llama.cpp, Ollama, TGI ni LM Studio.
- Dependencias declaradas: `huggingface_hub`, `mlx`, `numpy`, `gguf`, `transformers`, `sentencepiece`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| masahiroid/roberta-base-go_emotions-gguf | 124,7 M | el del modelo base (no especificado) | Clasificacion de 28 emociones (multi-etiqueta) | MIT | GGUF custom solo para MLX en Apple Silicon |
| SamLowe/roberta-base-go_emotions | 124,7 M | el del modelo base | Clasificacion de 28 emociones (multi-etiqueta) | MIT | Safetensors/PyTorch via Transformers, multiplataforma |
| masahiroid/roberta-base-go_emotions-coreml | 124,7 M | fijo, 128 tokens | Clasificacion de 28 emociones | MIT | Core ML, batch 1, ecosistema Apple |
| masahiroid/roberta-base-go_emotions-coreai | 124,7 M | fijo, 128 tokens | Clasificacion de 28 emociones | MIT | Core AI, batch 1, ecosistema Apple |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la unica diferencia documentada es el formato de empaquetado y la plataforma de ejecucion.

## Limitaciones y advertencias

- No es un GGUF estandar: no funciona en llama.cpp, Ollama ni LM Studio pese a la extension del archivo; el esquema es propio (`hf-native-mlx-v1`) y requiere el cargador MLX incluido.
- Requiere macOS con Apple Silicon; no hay soporte declarado para Linux, Windows o CUDA.
- No es una cuantizacion: los tensores estan en F32, por lo que no se obtienen los ahorros de memoria tipicos de un GGUF cuantizado.
- Modelo exclusivamente de clasificacion: no genera texto ni razona; no debe evaluarse como LLM.
- Idioma: solo ingles declarado; el caso de prueba en japones no implica soporte multilingue de calidad.
- Riesgo de sesgo y falsos positivos/negativos inherente al dataset GoEmotions y al modelo original; el autor no anade certificacion de seguridad ni evaluacion de sesgos.
- Las exportaciones Core ML y Core AI usan formas fijas (batch 1, secuencia 128), lo que obliga a rellenar o truncar y limita entradas largas.
- Compatibilidad de versiones no garantizada fuera del entorno probado (PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, etc.).
- Licencia MIT en pesos y codigo, sin licencia comercial adicional implicita; el autor remite a los terminos upstream en `LICENSE`.
- Proyecto con muy baja adopcion (205 descargas, 0 likes en el momento de la consulta): sin mantenimiento comunitario demostrado ni issues publicos conocidos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/masahiroid/roberta-base-go_emotions-gguf
- Modelo base original: https://huggingface.co/SamLowe/roberta-base-go_emotions
- Revision del modelo base usada en la conversion: https://huggingface.co/SamLowe/roberta-base-go_emotions/tree/d75048347613a25d77de8cf6412eaae9fa7b26be
- Variante MLX: https://huggingface.co/masahiroid/roberta-base-go_emotions-mlx
- Variante Core ML: https://huggingface.co/masahiroid/roberta-base-go_emotions-coreml
- Variante Core AI: https://huggingface.co/masahiroid/roberta-base-go_emotions-coreai
- README en japones: https://huggingface.co/masahiroid/roberta-base-go_emotions-gguf/blob/main/README.ja.md
- Paper del dataset GoEmotions: no disponible en la informacion proporcionada
- Repositorio de codigo o demo adicional: no disponible en la informacion proporcionada
