# gustavecortal/PhiloLM

## Resumen

PhiloLM es un modelo de lenguaje de 112 millones de parametros entrenado desde cero por Gustave Cortal sobre datos abiertos de filosofia (el corpus PhiloText). Se trata de un modelo base, sin ajuste por instrucciones, orientado a la generacion de texto y a la continuacion de pasajes filosoficos en ingles. Su interes principal no es la competicion en benchmarks generalistas, sino la demostracion de que un modelo pequeno puede entrenarse de forma reproducible en hardware de consumo (una unica Intel Arc A770 de 16 GB en 15,2 horas) y desplegarse hasta en el navegador mediante un motor WebAssembly de 8 bits.

Arquitectura transformer con innovaciones poco habituales en esta escala: embeddings de bigramas inyectados en las primeras 128 de 576 dimensiones del flujo residual, atencion local con ventana de 256 tokens combinada con atencion global (9 cabezas de consulta y 3 de clave-valor), normalizacion QK, RoPE parcial y redes feed-forward SwiGLU. El entrenamiento uso Muon para las matrices de pesos ocultas y AdamW para el resto de parametros, con atencion enmascarada por documento y ventanas que crecen de 1.024 a 2.048 tokens.

El modelo procesa 1.450 millones de tokens en cuatro pasadas ponderadas por fuente sobre los 450,8 millones de tokens de entrenamiento de PhiloText. La relevancia actual reside en su enfoque de eficiencia extrema: pesos en safetensors, licencia Apache-2.0 y una ruta de inferencia en CPU mediante WebAssembly que resulta unas tres veces mas rapida que PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion local (ventana de 256 tokens) y global, embeddings de bigramas, QK norm, RoPE parcial y SwiGLU |
| Parametros totales | 112.752.208 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (ventana final de entrenamiento; crece desde 1.024) |
| Tipos de cuantizacion | 8 bits (motor WebAssembly propio); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); core.wasm y core.bin para el motor WebAssembly |

## Arquitectura y entrenamiento

PhiloLM es un transformer decoder-only de 112M parametros. La innovacion mas destacable es la inyeccion de un embedding de bigramas: el vector de bigrama, multiplicado por una escala aprendida, se suma a las primeras 128 de las 576 dimensiones del flujo residual. El cuerpo se organiza en cuatro grupos de cuatro bloques; cada grupo contiene tres bloques de atencion local con ventana de 256 tokens y un bloque de atencion global con 9 cabezas de consulta y 3 de clave-valor. Cada bloque aplica RMSNorm y atencion causal con normalizacion QK y RoPE parcial, seguido de RMSNorm y una red SwiGLU con conexiones residuales. La cabeza LM esta atada al embedding de tokens.

El entrenamiento proceso 1.450 millones de tokens en cuatro pasadas ponderadas por fuente sobre los 450,8 millones de tokens de entrenamiento de PhiloText. Se uso atencion enmascarada por documento, ventanas que crecen de 1.024 a 2.048 tokens, el optimizador Muon para las matrices de pesos ocultas y AdamW para el resto de parametros. La ultima pasada enfatiza fuentes de referencia y textos primarios seleccionados. Los pesos publicados combinan los pesos finales con una media movil exponencial de la fase tardia del entrenamiento. El coste total fue de 15,2 horas en una unica Intel Arc A770 de 16 GB.

## Capacidades

- Generacion de texto en ingles con estilo academico y filosofico: continuacion de ensayos, articulos y pasajes argumentativos.
- Continuacion de temas filosoficos concretos (etica, epistemologia, filosofia de la mente, fenomenologia) con coherencia local razonable.
- Reproduccion de estructuras argumentativas y vocabulario tecnico del dominio filosofico.
- Inferencia en CPU mediante un motor WebAssembly de 8 bits incluido en el repositorio.
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento explicito (thinking mode).
- No soporta vision, audio ni modalidades adicionales.
- No es un modelo de instrucciones: no sigue ordenes ni conversa de forma multiturno de manera fiable.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Generacion de borradores de ensayo filosofico: el modelo puede producir continuaciones de un parrafo inicial sobre un tema (por ejemplo, "The problem of personal identity") que sirven como punto de partida para la redaccion humana, gracias a su entrenamiento especifico en el dominio.
- Prototipado educativo en el navegador: el motor WebAssembly de 8 bits permite desplegar el modelo en una pagina web sin backend GPU, util para demostraciones docentes de filosofia o de funcionamiento de modelos de lenguaje.
- Investigacion sobre arquitecturas eficientes: el codigo y los pesos permiten reproducir y estudiar el efecto de los embeddings de bigramas, la atencion local/global y el optimizador Muon en modelos pequenos.
- Experimentos de destilacion o ajuste fino: al ser un modelo base de 112M parametros con licencia Apache-2.0, puede ajustarse (SFT, LoRA) sobre corpus filosoficos especializados en una unica GPU de consumo.
- Generacion de material de estudio y resumenes de corrientes filosoficas: util para crear textos de apoyo que luego se revisan y corrigen manualmente.
- Analisis de estilo y vocabulario filosofico: el modelo puede emplearse para estudiar distribuciones lexicas y patrones argumentativos en textos generados frente a textos humanos del corpus PhiloText.
- Despliegue en entornos con recursos muy limitados: inferencia en CPU en portatiles o servidores sin GPU gracias al motor WebAssembly y al tamano reducido del modelo (0,7 GB de repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,45 GB de pesos, mas overhead de activaciones y cache KV; cabe holgadamente en cualquier GPU con 2 GB o mas.
- VRAM estimada en 8 bits: en torno a 0,12 GB de pesos, mas overhead; apto para CPU y GPUs integradas.
- GPU recomendadas: cualquier GPU moderna; el autor entreno el modelo en una Intel Arc A770 de 16 GB. Para inferencia basta con GPUs de gama baja (GTX 1650, RTX 3050) o incluso CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales y en muchas integradas.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), motor WebAssembly propio (wasmtime + numpy + tokenizers) y, en principio, cualquier runtime compatible con safetensors y arquitectura personalizada; no se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el motor WebAssembly de 8 bits es aproximadamente tres veces mas rapido que PyTorch en CPU segun el autor; no se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| PhiloLM | 112M | 2.048 | Apache-2.0 | Base, dominio filosofico, entrenado desde cero, inferencia WebAssembly |
| GPT-2 small | 124M | 1.024 | MIT | Base generalista, entrenado desde cero |
| Pythia-160M | 160M | 2.048 | Apache-2.0 | Base generalista, entrenado desde cero |
| TinyLlama-1.1B | 1.100M | 2.048 | Apache-2.0 | Base/chat generalista, mayor escala |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de PhiloLM con estas alternativas. La comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Es un checkpoint base sin ajuste por instrucciones: no sigue ordenes de forma fiable y no esta pensado para conversacion multiturno.
- Puede repetirse, perder coherencia argumentativa e inventar citas o atribuciones; para uso factual es necesario verificar contra las fuentes originales.
- Entrenado exclusivamente en ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de sesgos derivados del corpus PhiloText, que no se documenta en detalle en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no incluye garantias ni soporte; el autor no documenta evaluaciones de seguridad.
- La arquitectura requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo personalizado del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gustavecortal/PhiloLM
- Dataset PhiloText: https://huggingface.co/datasets/gustavecortal/PhiloText
- Demo web: https://gustavecortal.com/philosophy-lm/
- Perfil del autor: https://huggingface.co/gustavecortal
