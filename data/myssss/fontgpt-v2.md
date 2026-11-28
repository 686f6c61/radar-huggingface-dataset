# myssss/fontgpt-v2

## Resumen

fontgpt v2 es un modelo generativo de tipografias desarrollado por el usuario myssss. Se trata de un transformer decoder-only de 144,2 millones de parametros que dibuja glifos de fuentes como contornos Bezier: dado un TTF u OTF cualquiera y unas pocas letras de referencia, genera el resto de caracteres en el mismo estilo. El modelo no produce imagenes rasterizadas, sino geometria vectorial en forma de contornos Bezier, lo que lo hace directamente utilizable en flujos de diseno tipografico.

Es la sucesion de fontgpt v1.5 y mantiene el mismo tokenizador `outline2`, lo que permite comparar las perdidas de ambos modelos de forma directa. Las mejoras respecto a la version anterior incluyen el etiquetado del caracter en cada posicion, una unica capa de cross-attention en la capa 5 (frente a una por capa en v1.5), la eliminacion de fuentes de entrenamiento casi copias de las de evaluacion, el agrupamiento de glifos que comparten partes y un entrenamiento el doble de largo, de unos 3,4 mil millones de tokens.

El modelo es relevante para quienes trabajan en generacion de tipografias asistida, prototipado de fuentes y herramientas de diseno que necesitan completar juegos de caracteres a partir de muestras minimas. Su ventana de contexto es de 2.560 tokens y una secuencia puede contener hasta 16 glifos de una misma fuente, cada uno condicionado por su caracter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con cross-attention a texto de caracteres |
| Parametros totales | 144,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.560 tokens (hasta 16 glifos por secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre glifos, no sobre texto natural) |
| Licencia | other |
| Formato de pesos | `.pt` (checkpoint PyTorch con claves `model`, `model_config`, `data_config`, `merges`, `sources`, `step`) |

## Arquitectura y entrenamiento

El modelo consta de 16 capas, anchura 768, 12 cabezas de consulta y 3 cabezas clave/valor (atencion agrupada), MLP SwiGLU, skips tipo U-Net, compuertas de atencion que leen 16 canales, tres tablas de embedding de valores, un embedding de etiqueta de letra en cada posicion y cross-attention al texto del caracter unicamente en la capa 5. El vocabulario es de 1.085 tokens y el bloque de 2.560 tokens. El tokenizador es `outline2` con los parametros `--o2_q 128 --o2_nphi 23 --o2_nkap 8 --o2_tmode 1 --o2_fuse --o2_fine 8`, identico al de v1.5.

El entrenamiento se realizo durante 24.200 pasos de 142.400 tokens, aproximadamente 3,4 mil millones de tokens reales, con 200 pasos de calentamiento, tasa constante hasta el paso 16.100 y decaimiento lineal a cero en el ultimo tercio. Se uso el optimizador NorMuon para las matrices (con ortogonalizacion separada de las mitades clave y valor y meta-gradiente programado) y AdamW para el resto de parametros (beta2 0.997 para parametros 1-D), dropout 0.05 y omision de pasos no finitos. Respecto a v1.5, se anadio una etiqueta de letra en cada posicion, se redujo la cross-attention a una sola capa, se eliminaron fuentes de entrenamiento casi copias de las de evaluacion, la mitad de las secuencias agrupan glifos que comparten partes y la duracion del entrenamiento se duplico.

## Capacidades

- Generacion de contornos Bezier para glifos de fuentes a partir de un TTF/OTF de referencia.
- Transferencia de estilo: aprende el estilo de las letras de referencia y lo aplica a los caracteres solicitados.
- Generacion multi-glifo: una secuencia puede contener hasta 16 glifos de una misma fuente, cada uno condicionado por su caracter.
- Decodificacion determinista con dos modos: `median` (por defecto, toma la mediana de la distribucion en coordenadas y tensiones de curva) y `greedy` (toma siempre el token mas probable).
- Muestreo estocastico opcional mediante `--temperature` y `--seed` para resultados repetibles.
- Salida en multiples formatos: PNG (`specimen.png`), SVG por glifo (`U+XXXX.svg`) y TTF (`generated.ttf`).
- Soporte de mascara gramatical de contornos durante la decodificacion, con presupuesto de tokens por glifo.
- No dispone de tool calling, capacidades de agente, vision, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Completar juegos de caracteres de una fuente en desarrollo: dado un TTF con unas pocas letras dibujadas, el modelo genera el resto de glifos en el mismo estilo, lo que acelera el prototipado tipografico.
- Generacion de fuentes experimentales: partiendo de una muestra minima de referencia (`--refs "HOno"`), se obtienen glifos en SVG o TTF listos para editar en herramientas como FontForge o Glyphs.
- Exploracion de estilos: con `--temperature` y `--seed` se pueden generar variantes estocasticas de un mismo glifo para evaluar alternativas de diseno.
- Pruebas de concepto en herramientas de diseno: el modelo puede integrarse en un pipeline que lea un TTF, genere glifos y produzca un specimen PNG para revision visual con `--compare`.
- Investigacion en generacion de geometria vectorial: el tokenizador `outline2` y la mascara gramatical de contornos sirven como base para experimentos de generacion de formas con estructura sintactica.
- Prototipado rapido de fuentes para maquetas: generar un TTF completo aproximado a partir de una muestra para usarlo en pruebas de composicion antes de encargar la fuente definitiva.
- Comparacion de modelos de generacion de glifos: al compartir tokenizador y filas de evaluacion con v1.5, permite medir mejoras de arquitectura y datos de forma controlada.

## Benchmarks y rendimiento

Los resultados publicados comparan v2 con v1.5 sobre las mismas filas de evaluacion. La perdida se mide en nats (menor es mejor) y la similitud de forma con IoU (mayor es mejor).

| Metrica | v1.5 | v2 | Cambio |
|---|---|---|---|
| Perdida de test, nats por token (glifos retenidos de las fuentes de entrenamiento) | 1,694 | 1,645 | -0,049 |
| unseen-6, nats por glifo (64 fuentes retenidas, 5.898 glifos) | 107,44 | 103,65 | -3,79 |
| pool, nats por glifo (287 fuentes nunca entrenadas, 24.101 glifos) | 106,64 | 102,05 | -4,59 |
| Dibujos con `--decode greedy` (64 fuentes retenidas, 5.758 glifos) | 0,5003 | 0,5177 | +0,0174 |
| Dibujos con `--decode median` (por defecto, mismos glifos) | 0,5109 | 0,5275 | +0,0166 |

v2 mejora en todas las lineas. Por fuente, unseen-6 mejora en 64 de 64 fuentes y los dibujos con decodificacion mediana en 57 de 64. En las 22 fuentes retenidas sin copia cercana en el entrenamiento, las ganancias se mantienen: unseen-6 -5,3 nats por glifo y dibujos medianos +0,013. En la comparacion con la copia de la fuente de entrenamiento mas cercana (5.564 de 5.758 glifos), la decodificacion por defecto de v2 supera a la copia en 0,029 y la de v1.5 en 0,012.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 144,2 M de parametros en precision completa el modelo ocupa aproximadamente 0,6 GB, coherente con el tamano del repositorio.
- GPU recomendadas: no se especifican modelos concretos; la model card indica que en GPU es "mucho mas rapido" que en CPU, sin cifras.
- Cabe en GPU de consumo: si, por el reducido numero de parametros; no se detallan modelos concretos.
- Despliegue: el repositorio incluye `generate.py` como CLI de inferencia y el codigo del modelo en `code/` (`pengpt.py`, `repr_outline2.py`, `decode.py`, `strokes.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no serian aplicables directamente por tratarse de un modelo de generacion de contornos, no de texto.
- Latencia: aproximadamente 15 a 35 segundos por glifo en 4 nucleos de CPU con 3 glifos decodificados juntos, mas la carga del modelo. El coste por glifo baja al aumentar la lista de `--glyphs`.
- Dependencias: Python 3.10+ (probado con 3.12), torch 2.15 (build CPU), numpy 2.5, numba 0.68, fontTools 4.68, skia-pathops 0.9, pillow y huggingface_hub.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fontgpt v2 | 144,2 M | 2.560 tokens | Glifos como contornos Bezier, decoder-only | other | Hugging Face (`myssss/fontgpt-v2`) |
| fontgpt v1.5 | no disponible | no disponible | Glifos como contornos Bezier, mismo tokenizador `outline2` | other | Hugging Face (`myssss/fontgpt-v1.5`) |
| fontgpt v1 / v1 RL | no disponible | no disponible | Glifos con tokenizador pen-walk | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de generacion de glifos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia "other": no se detallan los terminos; es necesario revisar las condiciones antes de cualquier uso comercial.
- No se especifican los idiomas ni la cobertura de scripts; el modelo opera sobre glifos y caracteres, no sobre texto natural.
- Riesgo de dibujos incompletos: si el presupuesto de tokens por glifo (`--max_tokens`, por defecto 900) se agota, el dibujo se corta y puntua 0 en la evaluacion (94 a 95 de 5.758 glifos en ambos modelos).
- El prompt debe caber en la ventana de 2.560 tokens; en la evaluacion quedaron fuera 116 de 6.014 glifos en unseen-6 y 889 de 24.990 en pool.
- Las letras de referencia (`--refs`) deben existir en la fuente y tener contornos; en caso contrario la generacion no es posible.
- El rendimiento en CPU es lento (15 a 35 segundos por glifo en 4 nucleos), lo que limita su uso interactivo sin GPU.
- No se han publicado datos sobre sesgos, alucinacion en el sentido textual ni comportamiento multilingue, por lo que no aplican las advertencias habituales de modelos de lenguaje, pero tampoco hay garantias al respecto.
- La fecha de creacion del repositorio (2026-11-28) y el numero de descargas (0) indican un modelo muy reciente y sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myssss/fontgpt-v2
- Modelo predecesor: https://huggingface.co/myssss/fontgpt-v1.5
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos.
