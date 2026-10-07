# pb09204048/Inkling-Small-Hybrid-4layer

## Resumen

Inkling-Small-Hybrid-4layer es un recorte de 4 capas del modelo multimodal thinkingmachines/Inkling-Small, publicado por el usuario pb09204048 bajo licencia Apache 2.0. No es un modelo entrenado de forma independiente ni un ajuste fino: es una copia literal de un subconjunto de tensores del checkpoint original, con el `config.json` modificado unicamente en `text_config.num_hidden_layers = 4` y `text_config.local_layer_ids = [0, 1, 2]`. Su proposito declarado es servir como fixture de pruebas de integracion continua para el proyecto miles (radixark/miles), no la inferencia real.

El checkpoint conserva las capas de texto 0, 1, 2 y 5 del modelo original de 42 capas, renumeradas como 0-3: dos capas densas (0 y 1), una capa MoE con atencion local de ventana deslizante (2) y una capa MoE con atencion global (3, originalmente la 5). A diferencia de un recorte de las capas 0-3, mantiene una capa de atencion global, igual que el modelo completo. Tambien incluye los embeddings, la normalizacion final y el unembedding, todas las capas MTP (multi-token prediction) y los adaptadores de vision y audio, ademas del tokenizer, la plantilla de chat y los ficheros de procesador copiados sin cambios.

El dato de parametros reportado por los safetensors es de 17.514.768.396 (aproximadamente 17,5 mil millones), un numero muy superior al que corresponderia a 4 capas de un transformer convencional, porque el checkpoint arrastra la matriz de embeddings y la de unembedding completas del modelo original. El autor advierte explicitamente de que las capas se cortaron sin reentrenamiento alguno y que las salidas del modelo no son significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE); capas densas, capas MoE con atencion local (sliding-window) y capas MoE con atencion global; multimodal (adaptadores de vision y audio). Tipo de modelo declarado en los tags: `inkling_mm_model` |
| Parametros totales | 17.514.768.396 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en BF16, con algunos tensores de router en F32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, con tensores de router en F32), 35,1 GB de repositorio |

Otros datos: creado y actualizado el 2026-10-06, 0 descargas y 0 likes en el momento de la consulta. No se declara pipeline de inferencia.

## Arquitectura y entrenamiento

El modelo base del que procede este recorte, thinkingmachines/Inkling-Small, es un transformer multimodal con mezcla de expertos de 42 capas que combina atencion local de ventana deslizante y atencion global en capas separadas, e incorpora modulos MTP (multi-token prediction) junto con adaptadores para vision y audio. Este repositorio no introduce ningun entrenamiento: cada tensor es una copia byte a byte del checkpoint original, en su dtype original (BF16, mas algunos tensores de router en F32), y la unica diferencia es el recorte de capas y los dos campos modificados del `config.json`. La capa original 5 se almacena como capa 3.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo original recibio RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la combinacion de atencion local y global, los modulos MTP y la naturaleza multimodal del checkpoint. Dado que las capas se cortaron sin reentrenamiento, la coherencia funcional del conjunto de pesos esta rota: el modelo no ha sido optimizado para producir texto util.

## Capacidades

- No dispone de capacidades generativas utilizables. El autor indica que las salidas no son significativas al haberse cortado las capas sin reentrenamiento.
- Conserva la estructura multimodal del original: incluye adaptadores de vision y audio, aunque sin garantia de que funcionen de forma coherente con solo 4 capas.
- Conserva las capas MTP (multi-token prediction) del checkpoint original.
- Conserva el tokenizer, la plantilla de chat y los ficheros de procesador sin modificaciones, por lo que puede cargarse con el mismo pipeline de preprocesado que el modelo original.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible y, en la practica, no fiable dado el recorte.
- Capacidades multilingues: no disponible.
- Utilidad real: servir como fixture de pruebas de carga, sharding, cuantizacion y pipelines de CI, no como modelo de inferencia.

## Casos de uso

- Pruebas de integracion continua en miles: el repositorio se publico especificamente para los tests de CI de radixark/miles, de modo que permite validar el cargador de checkpoints y las rutas de ejecucion sin descargar el modelo completo.
- Validacion de cargadores de safetensors: al contener embeddings, unembedding, capas de texto, capas MTP y adaptadores multimodales, sirve para comprobar que un cargador resuelve correctamente todos los tipos de tensor, incluidos los de router en F32.
- Pruebas de sharding y paralelismo: con 35,1 GB de pesos en BF16 se puede verificar el reparto entre GPUs y el pipeline de tensor/pipeline parallelism en hardware limitado, algo inviable con el modelo completo.
- Desarrollo y validacion de soporte de cuantizacion: permite probar conversiones a 8 bits o 4 bits y verificar que la estructura MoE con atencion local y global se serializa y deserializa sin corromper tensores.
- Pruebas de integracion del procesador multimodal: al conservar el tokenizer, la plantilla de chat y los ficheros de procesador originales, se pueden validar rutas de preprocesado de texto, vision y audio sin depender del checkpoint completo.
- Benchmarking de infraestructura: medir tiempos de carga, memoria residente y overhead del runtime (vLLM, TGI u otros) con un checkpoint de estructura realista pero tamano reducido.
- Reproduccion de errores de cargadores: util para depurar fallos reportados por usuarios del modelo original en un entorno de ejecucion rapido y de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica ademas que el modelo no esta pensado para calidad de inferencia y que sus salidas no son significativas, por lo que cualquier evaluacion estandar (MMLU, HumanEval, GSM8K, etc.) careceria de valor interpretativo.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16 los pesos ocupan aproximadamente 35 GB (coincide con el tamano del repositorio, 35,1 GB); se necesitarian alrededor de 40 GB de VRAM para cargar el modelo con margen para activaciones y cache. En 8 bits la estimacion ronda los 18-20 GB y en 4 bits, los 10-12 GB, pero estos valores son estimaciones de calculo, no datos publicados, y no hay tipos de cuantizacion oficiales disponibles.
- GPU recomendadas: para BF16, una A100 80 GB, una H100 80 GB o dos GPU de 24 GB en configuracion multi-GPU. Para cargas de prueba con precision reducida, una RTX 4090 de 24 GB puede ser suficiente.
- Compatibilidad con GPU de consumo: si, en cuantizaciones de 8 o 4 bits cabe en tarjetas de 16-24 GB (RTX 4080, RTX 4090, RTX 5090). En BF16 no cabe en ninguna GPU de consumo actual de un solo chip.
- Opciones de despliegue: no hay confirmacion de soporte en vLLM, llama.cpp, Ollama ni TGI. El tag `inkling_mm_model` y la ausencia de pesos GGUF sugieren que se requiere la implementacion de referencia del modelo original o codigo remoto. No disponible.
- Latencia y throughput: no disponible. Ningun dato publicado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada. La unica referencia directa es el checkpoint original del que se extrajo este recorte.

| Modelo | Parametros totales | Capas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-Small-Hybrid-4layer | 17.514.768.396 | 4 (recorte de 42) | no disponible | apache-2.0 | HuggingFace |
| thinkingmachines/Inkling-Small | no disponible | 42 | no disponible | no disponible | HuggingFace |

Alternativas de la misma categoria (transformers multimodales MoE de aproximadamente 17B): no disponible, al no haberse proporcionado informacion sobre ellas.

## Limitaciones y advertencias

- Las capas se cortaron sin reentrenamiento: la coherencia funcional del modelo esta rota y las salidas no son significativas. No debe usarse para generacion en produccion ni para evaluacion de calidad.
- El recuento de parametros (17,5B) esta dominado por las matrices de embeddings y unembedding del modelo original; no refleja la capacidad efectiva de las 4 capas de texto conservadas.
- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgo, y dado que el modelo no produce salidas coherentes, dicha evaluacion no seria aplicable.
- Riesgo de alucinacion: total, en el sentido de que la salida no es una generacion fiable sino el resultado de un forward pass con capas ausentes. No debe interpretarse como texto valido.
- Limitaciones de contexto e idioma: no disponible. Se desconoce la longitud de contexto maxima efectiva y los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el fichero NOTICE si existe. Al derivar de thinkingmachines/Inkling-Small, conviene verificar los terminos del modelo original antes de cualquier uso mas alla de pruebas internas.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes; no hay pipelines declarados ni confirmacion de soporte en frameworks de inferencia habituales. El autor no ofrece garantias.
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo: son enlaces a foros sin relacion con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pb09204048/Inkling-Small-Hybrid-4layer
- Modelo original del que procede el recorte: https://huggingface.co/thinkingmachines/Inkling-Small
- Repositorio miles, para cuyos tests de CI se creo: https://github.com/radixark/miles
- Otros enlaces relevantes (papers, blogs, demos): no disponible. Las busquedas web realizadas no devolvieron resultados relacionados con el modelo.
