# AdiThorat19/qwen2.5-1.5b-salesforce-toolcalling-lora

## Resumen
El modelo `AdiThorat19/qwen2.5-1.5b-salesforce-toolcalling-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante SFT (Supervised Fine-Tuning) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Lo desarrolla el usuario AdiThorat19 y esta publicado en Hugging Face bajo la libreria PEFT. El nombre del repositorio sugiere que el objetivo del ajuste fino es el uso de tool calling en el contexto de Salesforce, aunque la model card no documenta ni el dataset de entrenamiento ni los hiperparametros empleados.

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only de 1.500 millones de parametros desarrollado por Alibaba Qwen, con una ventana de contexto de 32.768 tokens y soporte multilingue. Este adaptador no modifica los pesos del modelo base: se aplica como un delta de bajo rango que debe cargarse junto con Qwen2.5-1.5B-Instruct en tiempo de inferencia. El repositorio ocupa 0,1 GB, coherente con el tamano tipico de un adaptador LoRA.

La relevancia de esta ficha es limitada pero informativa: se trata de un experimento de ajuste fino orientado a function calling publicado sin documentacion tecnica. Resulta util como ejemplo de pipeline PEFT + TRL sobre Qwen2.5, pero no dispone de evaluacion, licencia declarada ni datos de entrenamiento verificables, por lo que no deberia considerarse listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | No disponible (modelo base: 1.500 millones; el adaptador LoRA no declara rango ni numero de parametros entrenables) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible en la model card (modelo base: 32.768 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | No disponible (modelo base: multilingue, incluye castellano) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento
El adaptador se entrena con PEFT 0.19.1 y TRL, aplicando LoRA sobre el transformer decoder-only del modelo base Qwen2.5-1.5B-Instruct. LoRA congela los pesos originales e introduce matrices de bajo rango en las proyecciones del transformer, reduciendo el numero de parametros entrenables y el coste de memoria durante el ajuste fino. El nombre del repositorio indica que el entrenamiento se ha orientado a tool calling en un contexto de Salesforce, probablemente mediante ejemplos de llamadas a funciones o APIs.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el rango LoRA, el alpha, la tasa de aprendizaje, la precision (fp16, bf16) ni si se aplicaron tecnicas de RLHF o DPO. La model card es una plantilla generica sin secciones cumplimentadas, y no se documentan innovaciones tecnicas adicionales (decodificacion especulativa, attention lineal, etc.). El repositorio solo declara la version de PEFT utilizada.

## Capacidades
- Generacion de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct.
- Tool calling / function calling: el nombre del repositorio sugiere un ajuste especifico para invocar funciones en entornos Salesforce, aunque no hay ejemplos ni evaluacion que lo confirmen.
- Razonamiento multi-paso y uso en pipelines de agentes: potencialmente soportado por el modelo base, no verificable en el adaptador.
- Capacidades multilingues: heredadas del modelo base (no declaradas explicitamente en la model card del adaptador).
- Codigo y matematicas: capacidades del modelo base, no evaluadas en este adaptador.
- No se declaran capacidades de vision, audio ni modos de pensamiento extendido.

## Casos de uso
- Prototipado de asistentes para Salesforce: el adaptador puede emplearse para experimentar con llamadas a funciones sobre objetos de Salesforce (cuentas, oportunidades, contactos) en un entorno de laboratorio, siempre que se valide manualmente la salida.
- Investigacion de pipelines PEFT + TRL: sirve como referencia para reproducir un flujo de SFT con LoRA sobre Qwen2.5-1.5B-Instruct y comparar hiperparametros.
- Pruebas de function calling en bajo presupuesto: al apoyarse en un modelo de 1.500 millones de parametros, permite iterar rapidamente en GPUs consumer antes de escalar a modelos mayores.
- Evaluacion de adaptadores en entornos CRM: util para medir como un LoRA de bajo rango afecta la precision de argumentos en llamadas a APIs estructuradas.
- Educacion y demos: ejemplo didactico de como se publica un adaptador LoRA en Hugging Face con la libreria PEFT.
- Base para ajustes posteriores: punto de partida para merges con el modelo base o para entrenamientos adicionales orientados a otros dominios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo de 1.500 millones de parametros, la VRAM depende principalmente del modelo base. En fp16 se estiman aproximadamente 3 GB para los pesos del base mas overhead del runtime; en cuantizacion de 4 bits (GGUF, AWQ) puede reducirse por debajo de 2 GB. El adaptador en si ocupa una fraccion minima (repositorio de 0,1 GB).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia del modelo base con el adaptador; A100 o H100 solo son necesarios para entrenamiento o serving a gran escala.
- Cabe en GPU consumer: si, con 8 GB de VRAM o superior en fp16, y con menos en cuantizacion de 4 bits.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM con soporte LoRA, llama.cpp/Ollama tras fusionar el adaptador con el modelo base o convertirlo a GGUF, TGI con adaptadores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AdiThorat19/qwen2.5-1.5b-salesforce-toolcalling-lora | Base 1.500 M + LoRA | No disponible (base: 32.768) | No disponible | safetensors (PEFT) | Adaptador experimental, sin evaluacion |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 | Apache 2.0 (modelo base) | safetensors, GGUF | Modelo base oficial, documentado y evaluado |
| Qwen/Qwen2.5-3B-Instruct | 3.000 M | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa de mayor tamano con mejor rendimiento general |
| meta-llama/Llama-3.2-1B-Instruct | 1.200 M | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Comparable en tamano, contexto mayor, licencia con restricciones |

## Limitaciones y advertencias
- La model card es una plantilla sin cumplimentar: no hay informacion sobre dataset, hiperparametros, evaluacion ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; debe contactarse con el autor o asumirse que no hay autorizacion explicita.
- El adaptador solo funciona junto con `Qwen/Qwen2.5-1.5B-Instruct`; no es un modelo autonomo.
- Riesgo elevado de alucinacion en tool calling no verificada: sin evaluacion, no hay garantia de que las llamadas a funciones sean sintacticamente validas ni semanticamente correctas.
- Sesgos: no documentados; hereda los sesgos del modelo base, que tampoco se detallan en esta ficha.
- Limitaciones de contexto e idioma: no declaradas en el adaptador; dependen del modelo base.
- Cero descargas y cero likes en el momento de la ficha, lo que indica ausencia de validacion por parte de la comunidad.
- No apto para produccion sin evaluacion adicional, validacion de argumentos y pruebas de robustez frente a entradas adversas.

## Enlaces
- Hugging Face: https://huggingface.co/AdiThorat19/qwen2.5-1.5b-salesforce-toolcalling-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Paper de PEFT (referencia): https://arxiv.org/abs/2106.09685
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- Referencia Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
