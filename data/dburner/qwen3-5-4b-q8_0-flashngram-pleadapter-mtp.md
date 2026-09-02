# dburner/Qwen3.5-4B-Q8_0-FlashNgram-PLEAdapter-MTP

## Resumen

Este modelo es un checkpoint experimental de investigación creado por el usuario dburner, no un lanzamiento oficial de Qwen. Parte de un backbone Qwen 3.5 4B en cuantización Q8_0 con soporte MTP (Multi-Token Prediction) y le añade un adaptador entrenable inspirado en PLE (Probabilistic Language Encoding) antes del bloque transformer 2. El adaptador consulta una tabla n-gram congelada procedente de Qwen 3.8 Flash, utilizando el token actual y dos predecesores, y aporta una contribución residual al hidden state del modelo base.

El objetivo del experimento es comprobar si una tabla de lookup n-gram externa puede mejorar la predicción del siguiente token sin modificar el backbone. Según la model card, el adaptador redujo la perplexity en WikiText-2 held-out respecto al control alpha-zero, pero no se demostró mejora en razonamiento, facticidad ni benchmarks. El modelo se distribuye en formato GGUF para llama.cpp, pero requiere una build específica con soporte para el grafo del adaptador PLE; una build estándar no lo ejecuta correctamente.

Se trata de una pieza de investigación con fines académicos, no un modelo listo para producción. La licencia es "other" y el autor advierte que hay que verificar las licencias de los componentes base (Qwen 3.5 y Qwen 3.8 Flash) antes de cualquier redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen 3.5 4B) con adaptador PLE-inspired y tabla n-gram congelada |
| Parametros totales | 55.539.721.729 (según safetensors; incluye la tabla n-gram congelada de Qwen 3.8 Flash) |
| Parametros activos | 13,1M entrenables (adaptador); el resto del backbone y la tabla están congelados |
| Longitud de contexto | 48.192 tokens (según el comando de ejemplo) |
| Tipos de cuantizacion | Q8_0 (backbone y adaptador); tabla n-gram en IQ4_NL |
| Idiomas soportados | en (inglés) |
| Licencia | other (verificar componentes base) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo combina un transformer estándar (Qwen 3.5 4B, 32 capas) con un adaptador externo que inyecta información n-gram. El adaptador, colocado antes del bloque 2, selecciona 16 filas de una tabla congelada de Qwen 3.8 Flash (forma `[160, 320001536]`) usando el token actual y dos predecesores, mediante 8 hashes bigram y 8 trigram. Cada fila produce un vector de 2560 dimensiones que se proyecta con `W_key` y `W_value` (sin bias). Una puerta sigmoide con `signed_sqrt` modula la contribución, y una convolución depthwise causal (kernel 4, dilation 3) añade contexto local. El resultado se escala con un parámetro `alpha` y se suma al hidden state antes de la RMSNorm del bloque 2. Con `alpha = 0`, el modelo se comporta exactamente como el backbone original.

El entrenamiento se realizó en PyTorch con el backbone y la tabla congelados. El piloto inicial usó WikiText-2 con next-token prediction; después se usaron registros empaquetados de 256 tokens, validación held-out y retención del mejor checkpoint. Es entrenamiento de language modeling, no instruction tuning. No se ha establecido paridad numérica entre el checkpoint exportado y la implementación en llama.cpp.

## Capacidades

- Generación de texto en inglés (idioma declarado).
- Predicción de siguiente token con inyección de información n-gram externa.
- Soporte de razonamiento (activado con `--reasoning on` en el comando de ejemplo) y MTP (draft-mtp) en el runtime de llama.cpp.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- No hay evidencia de mejora en benchmarks de razonamiento, facticidad o seguridad; la única métrica reportada es perplexity en WikiText-2.

## Casos de uso

- Investigación académica sobre integración de tablas n-gram en modelos transformer: permite estudiar si un lookup externo puede complementar el conocimiento paramétrico del modelo.
- Experimentos de ablación: al fijar `alpha = 0` se obtiene el control exacto del backbone, lo que facilita comparaciones controladas.
- Desarrollo de técnicas de adaptación ligera: el adaptador solo añade 13,1M parámetros entrenables, útil para probar métodos de fine-tuning eficiente.
- Evaluación de la influencia de la ventana de contexto local (bigram/trigram) en la coherencia del texto generado.
- Pruebas de compatibilidad con builds personalizadas de llama.cpp: sirve como banco de pruebas para implementar grafos de adaptadores no estándar.
- No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código o cualquier tarea que requiera fiabilidad, debido a su naturaleza experimental y a la falta de validación en benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica mencionada es la reducción de perplexity en WikiText-2 held-out respecto al control alpha-zero, pero no se proporcionan valores numéricos. La model card indica explícitamente que la evaluación HLE (Humanity's Last Exam) no demostró mejora y que no hay evidencia de mejora general en razonamiento o facticidad.

## Requisitos de hardware

- El archivo GGUF pesa 33,4 GB (incluye la tabla n-gram y los tensores MTP). Para cargarlo completo en GPU se necesita al menos 34 GB de VRAM.
- GPUs recomendadas: A100 40GB, A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, dos RTX 4090 de 24 GB con reparto de capas).
- En CPU es posible ejecutarlo con llama.cpp, pero la latencia será alta debido al tamaño del archivo y a la tabla n-gram.
- El comando de ejemplo usa `--n-gpu-layers 99`, lo que sugiere que se espera cargar todas las capas en GPU.
- Se requiere una build específica de llama.cpp con soporte para el adaptador PLE; una build estándar no ejecuta el grafo correctamente.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Este modelo es un experimento único sin equivalentes directos en el ecosistema. El backbone subyacente (Qwen 3.5 4B) podría compararse con otros modelos de 4B, pero no se dispone de datos de rendimiento de este checkpoint. El autor publicó un modelo anterior similar, `dburner/Qwen3.5-4B-Q8_0-FlashNgram-MTP`, que usa una inserción directa de la tabla n-gram sin el adaptador PLE, pero tampoco hay benchmarks públicos.

## Limitaciones y advertencias

- Modelo experimental: no es un lanzamiento oficial de Qwen ni una conversión de Qwen 3.8; no debe describirse como tal.
- No hay evidencia de mejora en razonamiento, facticidad, seguridad o benchmarks; la única métrica es perplexity en WikiText-2.
- La validación de desarrollo se usó para elegir hiperparámetros, por lo que no es una evaluación limpia.
- No se ha completado el control con tabla permutada por cabeza, lo que debilita la atribución causal de la mejora.
- No se ha establecido paridad numérica entre el checkpoint PyTorch y el exportado a GGUF.
- Requiere una build específica de llama.cpp; el uso con binarios estándar puede dar resultados incorrectos o fallos.
- Licencia "other": el autor advierte que hay que verificar las licencias de Qwen 3.5, Qwen 3.8 Flash y los datasets de entrenamiento antes de redistribuir.
- Riesgo de alucinación y sesgos no evaluados; no apto para uso en producción ni en sistemas críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dburner/Qwen3.5-4B-Q8_0-FlashNgram-PLEAdapter-MTP
- Modelo anterior similar (sin adaptador PLE): https://huggingface.co/dburner/Qwen3.5-4B-Q8_0-FlashNgram-MTP
- Repositorio de Qwen 3.5 (no oficial, de ABDtmx): https://github.com/ABDtmx/Qwen3.5
- Organización Qwen en HuggingFace: https://huggingface.co/Qwen
- Guía sobre Qwen 3.5 (sitio externo): https://qwen-ai.com/qwen-3-5/
