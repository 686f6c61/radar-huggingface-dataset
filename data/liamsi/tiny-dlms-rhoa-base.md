# liamsi/tiny-dlms-rhoa-base

## Resumen

tiny-dlms-rhoa-base es un modelo de lenguaje en miniatura de 2,36 millones de parametros desarrollado por liamsi como parte del proyecto educativo tiny-dlms. Se trata del checkpoint **base** (pre-entrenado, sin ajuste fino) de Rhoa, un "decision model" disenado para leer una situacion junto con una lista de opciones y puntuar cada una de ellas. El modelo se ha escrito y entrenado desde cero en PyTorch, sin utilizar la libreria `transformers` de Hugging Face, incluyendo tokenizador, arquitectura Transformer y bucle de entrenamiento.

La relevancia de este modelo es fundamentalmente didactica: sirve como punto de partida reproducible para entender el ciclo completo de pre-entrenamiento de un Transformer (tokenizacion BPE a nivel de byte, enmascarado de tokens, optimizacion) en un presupuesto de computo minimo. No esta pensado para produccion, tal y como advierte el propio autor. Su interes tecnico reside en la arquitectura compacta (4 capas de 128 dimensiones con 4 cabezas, mas una capa adicional donde las opciones "se miran entre si") y en el uso de bloques modernos (RMSNorm, RoPE, SwiGLU) dentro de un modelo de apenas 2 MB de pesos.

El modelo se distribuye bajo licencia MIT, soporta unicamente ingles y su pipeline declarado es `fill-mask`. El pre-entrenamiento se realizo sobre 2 GB de FineWeb-Edu (479 millones de tokens) mediante prediccion de tokens enmascarados al 15%, durante 38.000 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (masked language modeling) con 4 capas x 128 de ancho, 4 cabezas, mas 1 capa de atencion entre opciones |
| Parametros totales | 2.360.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

Rhoa-base es un Transformer encoder de tipo masked language model con 4 capas de 128 dimensiones y 4 cabezas de atencion, al que se anade una capa adicional en la que las representaciones de las distintas opciones interactuan entre si (atencion cruzada entre opciones). Emplea bloques modernos: RMSNorm para normalizacion, RoPE (rotary position embeddings) para codificar posiciones y SwiGLU como activacion en la MLP. La entrada tiene el formato `<cls> context <sep> option` y se trunca a 128 tokens. El tokenizador es un BPE a nivel de byte con un vocabulario de 8.192 tokens, entrenado especificamente sobre el corpus de pre-entrenamiento.

El pre-entrenamiento consistio en prediccion de tokens enmascarados (15% de tokens ocultos) sobre 2 GB de FineWeb-Edu, equivalentes a 479 millones de tokens, durante 38.000 pasos de entrenamiento. No se menciona en la informacion disponible el uso de RLHF, DPO ni ajuste por instrucciones; este checkpoint es exclusivamente el resultado del pre-entrenamiento auto-supervisado. El modelo se entrena con un codigo propio (`tiny-dlms`) que implementa desde cero tokenizador, arquitectura y bucle de entrenamiento en PyTorch.

## Capacidades

- Prediccion de tokens enmascarados (fill-mask) sobre texto en ingles: dado un contexto con huecos, estima el token oculto.
- Codificacion de contexto: `model.encode(idx)` devuelve un vector por token, utilizable como representacion de frases cortas.
- Puntuacion de opciones: la cabeza `mlm_head` puntua tokens ocultos, lo que permite usar el modelo como base para tareas de seleccion entre opciones tras el ajuste fino.
- Capacidad de decision: **no** en este checkpoint; el modelo base no esta ajustado para tareas de decision. Para decisiones debe usarse `liamsi/tiny-dlms-rhoa`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Docencia y aprendizaje de pre-entrenamiento: el modelo sirve como ejemplo completo y reproducible del pipeline de entrenamiento de un Transformer (tokenizador, enmascarado, optimizacion) en un presupuesto minimo, adecuado para cursos y talleres.
- Experimentacion con arquitecturas: al ser codigo propio en PyTorch, permite modificar bloques (RMSNorm, RoPE, SwiGLU) y medir el efecto sobre la perplejidad de enmascarado sin depender de `transformers`.
- Punto de partida para ajuste fino: es el checkpoint base sobre el que se construye `tiny-dlms-rhoa`; util para quien quiera reproducir el ajuste fino hacia tareas de decision.
- Pruebas de tokenizadores BPE de vocabulario reducido: permite estudiar el comportamiento de un vocabulario de 8.192 tokens a nivel de byte en tareas de fill-mask sobre texto web.
- Benchmarking de modelos en miniatura: sirve como referencia de linea base (47,7% de acierto en tokens ocultos) para comparar variantes como `rhoa-small` o `rhoa-gpt2`.
- Prototipado de pipelines de evaluacion: al ser ligero, permite iterar rapidamente en scripts de evaluacion de masked language modeling antes de escalar a modelos mayores.
- Educacion en eficiencia computacional: demuestra que es posible entrenar un modelo funcional con 2,36 M de parametros y 479 M de tokens, ilustrando conceptos de escala y compromiso entre capacidad y coste.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision en tokens enmascarados (texto web held-out) | 47,7% |
| bAbI (tarea de decision, modelo ajustado `rhoa`) | 100% (solo la version ajustada) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que el modelo no esta disenado para esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precision completa (2,36 M de parametros), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna; no requiere A100, H100 ni RTX 4090. Funciona en CPU sin problemas.
- Cabe en GPU consumer: si, en todas (incluso GPUs integradas).
- Opciones de despliegue: el modelo usa la libreria propia `tiny-dlms` (instalable via `pip install "tiny-dlm[hub] @ git+https://github.com/benisalla/tiny-dlms"`); no se han publicado variantes para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada, aunque por su tamano se espera una latencia de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-dlms-rhoa-base | 2,36 M | 128 tokens | Fill-mask (base de decision model) | MIT | Hugging Face |
| tiny-dlms-rhoa | no disponible | 128 tokens | Decision model ajustado | MIT | Hugging Face |
| tiny-dlms-rhoa-small | no disponible | 128 tokens | Decision model ajustado (version pequena) | MIT | Hugging Face |
| tiny-dlms-rhoa-gpt2 | no disponible | 128 tokens | Rhoa con bloques GPT-2 | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla del resultado de bAbI (100% en `rhoa`) y la precision de enmascarado del modelo base (47,7%). No se conocen modelos externos directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo educativo, no de produccion: el propio autor lo describe como "a learning project, not a production model".
- No es un modelo de decision: es el checkpoint base pre-entrenado; para decisiones debe usarse `tiny-dlms-rhoa`.
- Contexto muy limitado: solo 128 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Solo ingles: no soporta castellano ni otros idiomas.
- Riesgo de alucinacion y salidas incoherentes: con 2,36 M de parametros y 479 M de tokens de entrenamiento, la calidad del texto generado o completado es muy limitada.
- Sesgos: al entrenarse sobre FineWeb-Edu, puede heredar sesgos presentes en ese corpus web, aunque no se documentan analisis especificos.
- Licencia MIT: permite uso comercial, pero el modelo no es adecuado para ello por su calidad y alcance.
- Dependencia de libreria propia: requiere instalar `tiny-dlms` desde GitHub, sin soporte en ecosistemas estandar como `transformers`.
- Sin variantes cuantizadas ni soporte en herramientas de despliegue habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liamsi/tiny-dlms-rhoa-base
- Repositorio GitHub del proyecto: https://github.com/benisalla/tiny-dlms
- Pagina del proyecto: https://benisalla.github.io/tiny-dlms/
- Modelo ajustado tiny-dlms-rhoa: https://huggingface.co/liamsi/tiny-dlms-rhoa
- Variante tiny-dlms-rhoa-small: https://huggingface.co/liamsi/tiny-dlms-rhoa-small
- Variante tiny-dlms-rhoa-gpt2: https://huggingface.co/liamsi/tiny-dlms-rhoa-gpt2
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Modelo tiny-dlms-melon-car: https://huggingface.co/liamsi/tiny-dlms-melon-car
- Modelo tiny-dlms-melon-car-small: https://huggingface.co/liamsi/tiny-dlms-melon-car-small
- Modelo tiny-dlms-melon-maze: https://huggingface.co/liamsi/tiny-dlms-melon-maze
