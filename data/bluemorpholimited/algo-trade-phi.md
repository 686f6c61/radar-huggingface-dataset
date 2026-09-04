# bluemorpholimited/algo-trade-phi

## Resumen

Algo Trade Phi es un modelo de lenguaje pequeno (SLM) fine-tuned por el usuario de Hugging Face `bluemorpholimited` a partir de `microsoft/Phi-4-mini-instruct` (3.8B de parametros). El objetivo declarado es generar senales de trading algoritmico: el modelo produce recomendaciones BUY/SELL/HOLD junto con niveles de entrada, stop y objetivo. El entrenamiento combina dos etapas: un ajuste fino con LoRA (SFT) sobre 10 ejemplos financieros y una alineacion posterior mediante DPO con 7 pares de preferencia (decisiones buenas frente a malas). La relevancia del modelo reside en explorar el uso de SLMs en finanzas, aunque el dataset de entrenamiento es extremadamente reducido, lo que plantea dudas sobre su capacidad de generalizacion. La arquitectura es la del modelo base Phi-4-mini-instruct, con un total de 3.836.021.856 parametros. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Phi-4-mini-instruct) |
| Parametros totales | 3.836.021.856 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF, 2,35 GB) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo `microsoft/Phi-4-mini-instruct`, un SLM de 3.800 millones de parametros. El proceso de entrenamiento descrito en la model card incluye un ajuste fino con adaptadores LoRA (SFT) utilizando 10 ejemplos de trading, seguido de una alineacion con DPO basada en 7 pares de preferencia (elegido vs. rechazado). El entrenamiento se realizo en una GPU NVIDIA RTX PRO 6000 Blackwell. Posteriormente, los adaptadores LoRA se fusionan con el modelo base, se exportan a GGUF en precision F16 y se cuantizan a Q4_K_M. No se describe ninguna innovacion tecnica destacable: se trata de la aplicacion de tecnicas estandar de fine-tuning y cuantizacion sobre un modelo existente. El tamano del dataset de entrenamiento es excepcionalmente pequeno, lo que sugiere un ajuste muy especifico y con alta probabilidad de sobreajuste.

## Capacidades

- Generacion de senales de trading: produce recomendaciones BUY/SELL/HOLD con niveles de entrada, stop y objetivo.
- Uso conversacional: el modelo esta etiquetado como `conversational` en Hugging Face.
- No se proporciona informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio.
- Capacidades multilingues no disponibles.
- Razonamiento: limitado por el tamano del modelo base (3.8B) y por el reducido dataset de entrenamiento.

## Casos de uso

Los siguientes casos de uso son hipoteticos, basados en el proposito declarado del modelo. La informacion disponible no incluye evaluaciones que confirmen su rendimiento real.

- Generacion de senales en sistemas de backtesting: el modelo puede producir senales BUY/SELL/HOLD con niveles de entrada, stop y objetivo, que podrian integrarse en scripts de backtesting para simular estrategias.
- Asistente de analisis tecnico: puede responder consultas sobre posiciones y sugerir niveles de gestion de riesgo, aunque su conocimiento esta limitado a los 10 ejemplos de entrenamiento.
- Integracion en pipelines de trading automatizado: mediante llama.cpp o una API local, el modelo podria emitir senales en tiempo real, pero requiere una validacion externa exhaustiva antes de su uso en produccion.
- Educacion financiera: puede servir para ilustrar decisiones de trading en entornos de aprendizaje, siempre con supervision humana, dado el riesgo de alucinacion.
- Prototipado de chatbots para traders: el modelo puede actuar como componente de un asistente conversacional para explicar conceptos basicos de trading, aunque sus capacidades son limitadas.
- Generacion de resumenes de operaciones: podria redactar descripciones de posiciones abiertas o cerradas, pero no se dispone de informacion que confirme esta capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 3.836.021.856 parametros. En precision FP16, los pesos ocuparian aproximadamente 7,6 GB.
- El archivo GGUF Q4_K_M proporcionado pesa 2,35 GB, por lo que la inferencia en GPU requiere un minimo de 4-6 GB de VRAM (considerando overhead de contexto).
- En CPU, se recomienda al menos 8 GB de RAM para ejecutar el modelo cuantizado con llama.cpp.
- GPU recomendada: cualquier tarjeta con al menos 6 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4060 8GB). La GPU usada en entrenamiento (RTX PRO 6000 Blackwell) no es necesaria para inferencia.
- El log de compilacion incluido en la model card muestra que llama.cpp se compilo en macOS ARM64, lo que indica compatibilidad con Apple Silicon. La compilacion no se completo por falta de CUDA, lo que no impide el uso en CPU/Metal.
- Opciones de despliegue: llama.cpp (para el GGUF), Ollama (puede importar archivos GGUF). No se proporcionan evidencias de compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparativas con otros modelos.

## Limitaciones y advertencias

- Dataset de entrenamiento extremadamente pequeno: 10 ejemplos SFT y 7 pares DPO. Esto implica un alto riesgo de sobreajuste y una capacidad de generalizacion muy limitada a datos de mercado reales.
- No se han publicado benchmarks ni evaluaciones, por lo que no existe evidencia objetiva de rendimiento.
- La licencia no esta definida, lo que genera incertidumbre sobre el uso comercial.
- No se especifican los idiomas soportados. El nombre del modelo y el contexto sugieren ingles, pero no esta confirmado.
- Riesgo de alucinacion en decisiones financieras: el modelo no debe utilizarse como asesor financiero sin supervision humana.
- El log de compilacion de llama.cpp muestra una configuracion incompleta en macOS por ausencia de CUDA, lo que puede indicar problemas de despliegue en entornos que requieran GPU NVIDIA.
- No se documentan capacidades de tool calling, vision, audio ni soporte de agentes.

## Enlaces

- Hugging Face: https://huggingface.co/bluemorpholimited/algo-trade-phi
- No se encontraron enlaces adicionales especificos (papers, blogs, repositorios o demos) en la busqueda web.
