# gustavecortal/philosophy-lm

## Resumen

PhiloLM es un modelo de lenguaje de 112,7 millones de parámetros entrenado desde cero (no es un ajuste fino de un modelo preexistente) sobre un corpus abierto de filosofía, PhiloText. Lo desarrolla Gustave Cortal y se distribuye bajo licencia Apache-2.0. El modelo resuelve un nicho concreto: la generación de texto con registro y vocabulario filosófico en inglés, con un coste computacional muy bajo y la posibilidad de ejecutarse íntegramente en el navegador mediante un motor WebAssembly de 8 bits.

Arquitectónicamente es un transformer decoder-only con una innovación poco habitual: incorpora un embedding de bigramas que se suma a las primeras 128 dimensiones del flujo residual, combinando información de n-gramas con atención causal. Usa atención local con ventana de 256 tokens intercalada con atención global, QK norm y RoPE parcial. El contexto de entrenamiento es de 2.048 tokens.

Su relevancia actual es doble: por un lado, demuestra que es posible entrenar un modelo de lenguaje funcional en 15,2 horas sobre una única GPU de consumo (Intel Arc A770 de 16 GB); por otro, su licencia permisiva y su tamaño lo hacen adecuado para experimentación educativa, despliegue en entornos con recursos limitados y estudio de arquitecturas alternativas. Es un modelo base, sin ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con embedding de bigramas, atención local (ventana de 256 tokens) y global, QK norm y RoPE parcial |
| Parametros totales | 112.752.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | 8 bits (motor WebAssembly propio); no se documentan otros formatos |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); core.wasm + core.bin para el motor WebAssembly |

## Arquitectura y entrenamiento

El modelo sigue un diseño decoder-only de 112M parámetros con cuatro grupos de cuatro bloques cada uno (16 bloques). Dentro de cada grupo hay tres bloques de atención local con ventana de 256 tokens y un bloque de atención global con 9 cabezas de consulta y 3 cabezas clave-valor (GQA). Cada bloque incluye RMSNorm previo, atención causal con QK norm y RoPE parcial, seguido de una red feed-forward SwiGLU con conexiones residuales. La particularidad principal es el embedding de bigramas: el vector de bigrama, multiplicado por una escala aprendida, se añade a las primeras 128 de las 576 dimensiones del flujo residual, inyectando información de coocurrencia de pares de tokens en cada paso. La cabeza LM está atada al embedding de tokens.

El entrenamiento procesó 1.450 millones de tokens en cuatro pasadas ponderadas por fuente sobre los 450,8 millones de tokens de entrenamiento de PhiloText. Se empleó atención con máscara a nivel de documento, ventanas que crecen de 1.024 a 2.048 tokens, el optimizador Muon para las matrices de pesos ocultas y AdamW para el resto de parámetros. La última pasada da más peso a fuentes de referencia y textos primarios seleccionados. Los pesos publicados son una mezcla de los pesos finales con una media móvil exponencial del tramo final del entrenamiento. El entrenamiento completo requirió 15,2 horas en una Intel Arc A770 de 16 GB.

## Capacidades

- Generación de texto en inglés con registro académico y vocabulario filosófico: continuaciones de ensayos, definiciones de conceptos y paráfrasis de argumentos.
- Razonamiento discursivo básico sobre temas de filosofía (ética, epistemología, metafísica, fenomenología), limitado a la coherencia de un párrafo.
- Capacidad multilingüe: únicamente inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- Ejecución en navegador mediante motor WebAssembly de 8 bits, aproximadamente tres veces más rápido que PyTorch en CPU.
- Generación rápida en CPU mediante `generate_fast.py` con wasmtime, numpy y tokenizers.

## Casos de uso

- Experimentación educativa sobre arquitecturas transformer: el código y los pesos permiten estudiar el efecto del embedding de bigramas y de la mezcla de atención local y global en un modelo que cabe en una GPU de consumo.
- Generación de borradores de texto filosófico: útil para producir párrafos iniciales sobre conceptos como justicia, causalidad o identidad personal que luego un humano revisa y corrige.
- Despliegue en el navegador sin servidor: el motor WebAssembly de 8 bits permite ofrecer una demo interactiva de generación de texto sin coste de infraestructura de GPU.
- Prototipado de pipelines de generación en CPU: con 112M parámetros y cuantización a 8 bits, se puede integrar en aplicaciones de escritorio o entornos embebidos donde no hay GPU disponible.
- Investigación sobre entrenamiento de bajo coste: sirve como caso de referencia reproducible (15,2 horas en una Arc A770) para estudiar optimizadores como Muon y estrategias de ponderación de fuentes.
- Generación de material de apoyo para docencia de filosofía: producir ejemplos de estilo y vocabulario que el profesorado puede editar, siempre con verificación posterior de citas y atribuciones.
- Estudio de sesgos y alucinación en modelos pequeños: su tendencia documentada a inventar citas lo convierte en un caso útil para investigar detección de atribuciones falsas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 0,45 GB solo para pesos, más activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- VRAM estimada con cuantización a 8 bits: en torno a 0,12 GB para los pesos, más overhead del runtime.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB; el entrenamiento se realizó en una Intel Arc A770 de 16 GB, lo que indica que una GPU de consumo es suficiente.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o Intel Arc A770, y también en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True`; motor WebAssembly propio vía wasmtime (`generate_fast.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas; el autor indica que el motor WebAssembly de 8 bits es aproximadamente tres veces más rápido que PyTorch en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| PhiloLM | 112,7M | 2.048 | Apache-2.0 | Filosofía, entrenado desde cero, motor WASM | Hugging Face, demo web |
| GPT-2 small | 124M | 1.024 | MIT | Texto general, entrenado desde cero | Hugging Face |
| Pythia-160M | 160M | 2.048 | Apache-2.0 | Texto general, suite de investigación | Hugging Face |
| TinyLlama-1.1B | 1.100M | 2.048 | Apache-2.0 | Texto general, ajustado por instrucciones | Hugging Face |

La comparación se limita a parámetros, contexto y licencia, ya que no hay benchmarks publicados de PhiloLM que permitan contrastar rendimiento. Frente a GPT-2 small y Pythia-160M, PhiloLM ofrece un dominio especializado y ejecución en navegador, pero carece de la documentación de evaluación y el ecosistema de herramientas de aquellos. Frente a TinyLlama, es mucho más pequeño y no está ajustado por instrucciones.

## Limitaciones y advertencias

- Es un checkpoint base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y puede repetirse o perder coherencia argumentativa.
- Riesgo alto de alucinación de citas y atribuciones: el propio autor advierte de que puede inventar referencias; cualquier uso factual requiere verificación contra las fuentes originales.
- Solo soporta inglés; no hay capacidades multilingües.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenado sobre un corpus filosófico específico, lo que puede introducir sesgos de selección de fuentes y un registro poco adecuado para otros dominios.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez.
- No dispone de soporte de tool calling ni de integración con frameworks de agentes.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de garantías y de evaluación de calidad hace desaconsejable su uso en producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gustavecortal/philosophy-lm
- Dataset PhiloText: https://huggingface.co/datasets/gustavecortal/PhiloText
- Demo web en el navegador: https://gustavecortal.com/philosophy-lm/
- Cita del autor: Cortal, Gustave (2026), "PhiloLM: a small language model trained on philosophy", https://huggingface.co/gustavecortal/PhiloLM
