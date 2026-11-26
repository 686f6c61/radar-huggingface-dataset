# oddadmix/femto-voca-arabic

## Resumen

femto-voca-arabic es un modelo de síntesis de voz (text-to-speech) para árabe estándar moderno (فصحى) desarrollado por oddadmix. Se trata de la variante de un dieciseisavo de tamaño de tiny-voca-arabic v2.1: un modelo de solo 282.587 parámetros entrenado desde cero sobre datos árabes, que reutiliza la arquitectura y el código de entrenamiento del proyecto tiny-voca de Muhammed Nazeem (n4ze3m) con capas más estrechas. Convierte texto en audio de 24 kHz e incluye el generador de forma de onda, sin vocoder neuronal separado.

El modelo ofrece ocho voces en cuatro estilos de habla (asistente, noticias, relato y promoción, con una voz femenina y otra masculina en cada estilo) y mantiene exactamente las mismas entradas, salidas y orden de voces que tiny-voca-arabic v2.1, por lo que funciona como reemplazo directo cuando priman el tamaño o la velocidad sobre la calidad máxima. Su formato ONNX y su naturaleza ultraligera lo hacen apto para inferencia en CPU.

Su relevancia actual radica en la eficiencia extrema: unos 370× tiempo real en cuatro hilos de CPU con ONNX, con un rendimiento en tasa de error de caracteres muy cercano al de su hermano mayor de 4,5M de parámetros. Es un caso de estudio de hasta qué punto se puede comprimir un sistema TTS neuronal manteniendo inteligibilidad en un idioma con fonología compleja como el árabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red tiny-voca (arquitectura original de tiny-voca con capas mas estrechas); predictor de duraciones, pausas, tono, sonoridad y energia mas sintetizador fuente-filtro |
| Parametros totales | 282.587 (1,2 MB en PyTorch, 4,4 MB en ONNX) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | arabe (arabe estandar moderno, MSA) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime); el autor menciona tambien pesos PyTorch de 1,2 MB |

Anchura de capas: 48 canales, 144 en feed-forward y 32 en el predictor.

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de tiny-voca: una red neuronal que predice duraciones, pausas, tono (pitch), sonoridad (voicing) y energia a partir del texto, y un sintetizador fuente-filtro que genera la forma de onda directamente, sin vocoder neuronal independiente. Respecto a tiny-voca-arabic v2.1, mantiene el mismo numero de capas pero reduce la anchura de 192/640/128 a 48/144/32 canales, lo que explica la reduccion de 4,5M a 0,28M de parametros.

El modelo se entreno desde cero sobre el dataset oddadmix/tiny-voca-arabic-v2.1-dataset, con la misma receta que v2.1, y no reutiliza pesos de tiny-voca. El front-end de texto incluye lectura de numeros como palabras en MSA, diacritizacion con CATT, un fonemizador basado en reglas de 49 simbolos para arabe estandar moderno (code/arabic_frontend.py) y posteriormente la red tiny-voca. No se documenta en la informacion disponible el volumen de tokens ni si hubo etapas de RLHF o DPO.

## Capacidades

- Sintesis de voz a partir de texto en arabe estandar moderno, con salida de audio a 24 kHz.
- Ocho voces predefinidas en cuatro estilos (asistente, noticias, relato y promocion), con una voz femenina y otra masculina por estilo.
- Conversion de numeros a palabras en MSA y diacritizacion automatica mediante CATT.
- Fonemizacion basada en reglas para arabe estandar moderno.
- Generacion de forma de onda integrada (sin vocoder neuronal externo).
- Inferencia en CPU con ONNX Runtime, con un rendimiento de aproximadamente 370× tiempo real en cuatro hilos.
- Compatibilidad drop-in con tiny-voca-arabic v2.1: mismas entradas, salidas y orden de voces.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multimodal (es un modelo TTS).

## Casos de uso

- Lectura de noticias y boletines automatizados: la voz de estilo noticias (nf2, nm2) permite generar locuciones de articulos o resumenes con una calidad de CER entre 0,4% y 3,0% en validacion y test, adecuada para podcasts y alertas informativas.
- Asistentes de voz embebidos en dispositivos con recursos limitados: al ocupar 4,4 MB en ONNX y ejecutarse a 370× tiempo real en cuatro hilos de CPU, puede integrarse en routers, televisiones o electrodomesticos sin GPU.
- Audiolibros y narracion de relatos: las voces de estilo relato (sf1, sm3) presentan las tasas de error mas bajas del modelo (0,0%–0,4% en frases nuevas) y duraciones cercanas a las grabaciones originales (0,94–0,96), lo que las hace idoneas para narracion larga.
- Anuncios y promociones de voz: las voces promo (pf4, pm2) estan pensadas para mensajes publicitarios y avisos de tienda, con CER de 0,3%–1,8% en frases nuevas y test.
- Accesibilidad y lectura de pantalla en arabe: el modelo puede convertir texto de interfaces o documentos en voz para usuarios con discapacidad visual, ejecutandose en el propio dispositivo sin conexion.
- Sistemas de megafonia y avisos en espacios publicos: la velocidad de sintesis (370× tiempo real) permite generar mensajes en tiempo real en hardware de bajo coste.
- Prototipado y pruebas de pipelines TTS: al ser un reemplazo directo de v2.1 con el mismo interfaz, sirve para validar arquitecturas o integrar TTS en aplicaciones antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluacion mediante transcripciones con Whisper large-v3 del audio generado frente al texto de entrada (sin diacriticos ni puntuacion). CER con el CER de las grabaciones originales entre parentesis:

| Voz | Validacion | Test | Frases nuevas |
|---|---|---|---|
| a000 asistente F | 0,4% (0,6%) | 1,6% (1,8%) | 0,5% |
| am6 asistente M | 0,4% (0,5%) | 0,3% (0,2%) | 0,2% |
| nf2 noticias F | 0,8% (1,7%) | 3,0% (3,5%) | 1,9% |
| nm2 noticias M | 0,4% (0,5%) | 1,0% (1,0%) | 1,1% |
| sf1 relato F | 0,4% (0,3%) | 0,4% (0,5%) | 0,3% |
| sm3 relato M | 0,4% (0,5%) | 0,3% (0,3%) | 0,0% |
| pf4 promo F | 2,3% (2,5%) | 1,8% (2,0%) | 0,3% |
| pm2 promo M | 1,0% (0,9%) | 1,3% (1,5%) | 0,6% |

Comparativa directa con tiny-voca-arabic v2.1:

| Metrica | femto-voca-arabic | tiny-voca-arabic v2.1 |
|---|---|---|
| Parametros | 282.587 | 4.534.411 |
| Anchura (canales / feed-forward / predictor) | 48 / 144 / 32 | 192 / 640 / 128 |
| Velocidad en CPU, 4 hilos (ONNX) | ~370× tiempo real | ~200× tiempo real |
| CER validacion / test / frases nuevas | 0,8% / 1,2% / 0,6% | 0,8% / 1,1% / 0,5% |
| Calidad DNSMOS P.808 (40 muestras) | 3,63 | 3,76 |

Las duraciones generadas quedan dentro del 7% de las grabaciones en todas las voces. Cada voz esta a menos de 0,8 puntos de CER respecto a v2.1.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal; el modelo esta disenado para CPU. El fichero ONNX ocupa 4,4 MB, por lo que la huella de memoria es minima.
- GPU recomendadas: no se documentan; cualquier GPU con soporte ONNX Runtime puede ejecutarlo, pero el diseno apunta a CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el rendimiento declarado (370× tiempo real) corresponde a cuatro hilos de CPU.
- Opciones de despliegue: ONNX Runtime (libreria oficial del modelo), con dependencias onnxruntime, numpy, soundfile y tqdm. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: aproximadamente 370× tiempo real en cuatro hilos de CPU con ONNX, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| femto-voca-arabic | 282.587 | no disponible | CER 0,8%/1,2%/0,6%; DNSMOS 3,63 | Apache-2.0 | Hugging Face (ONNX) |
| tiny-voca-arabic v2.1 | 4.534.411 | no disponible | CER 0,8%/1,1%/0,5%; DNSMOS 3,76 | Apache-2.0 | Hugging Face |
| pico-voca-arabic | 0,56M (segun el autor) | no disponible | no disponible | no disponible | Hugging Face |
| nano-voca-arabic | 1,2M (segun el autor) | no disponible | no disponible | no disponible | Hugging Face |
| micro-voca-arabic | 2,3M (segun el autor) | no disponible | no disponible | no disponible | Hugging Face |
| atto-voca-arabic | 0,14M (segun el autor) | no disponible | no disponible | no disponible | Hugging Face |

La familia oddadmix ofrece variantes de 0,14M, 0,28M, 0,56M, 1,2M, 2,3M y 4,5M de parametros, todas con la misma receta y datos. No se dispone de datos de benchmarks de las variantes intermedias en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta arabe estandar moderno; no cubre dialectos arabes ni otros idiomas.
- La calidad es inferior a la de tiny-voca-arabic v2.1 en DNSMOS (3,63 frente a 3,76), aunque la diferencia en CER es pequena.
- La voz nf2 (noticias femenina) muestra el peor CER en test (3,0%) y en frases nuevas (1,9%), por lo que es la menos fiable del conjunto.
- Riesgo de errores de pronunciacion en textos con numeros, nombres propios o diacritizacion ambigua, dado que el front-end es basado en reglas.
- No se documentan sesgos especificos ni evaluaciones de robustez ante texto ruidoso o fuera de dominio.
- No se documentan limitaciones de longitud de texto ni de contexto en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial con atribucion y conservacion del aviso de licencia; conviene revisar las condiciones del proyecto tiny-voca original del que deriva la arquitectura.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion externa.
- La model card consultada aparece truncada al final; pueden existir detalles de uso no recogidos aqui.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/femto-voca-arabic
- Demo: https://huggingface.co/spaces/oddadmix/femto-voca-arabic
- Dataset: https://huggingface.co/datasets/oddadmix/tiny-voca-arabic-v2.1-dataset
- Modelo base de tamano completo (tiny-voca-arabic v2.1): https://huggingface.co/oddadmix/tiny-voca-arabic-v2.1
- Variante doble (pico-voca-arabic): https://huggingface.co/oddadmix/pico-voca-arabic
- Variante cuarta (nano-voca-arabic): https://huggingface.co/oddadmix/nano-voca-arabic
- Variante mitad (micro-voca-arabic): https://huggingface.co/oddadmix/micro-voca-arabic
- Variante 1/32 (atto-voca-arabic): https://huggingface.co/oddadmix/atto-voca-arabic
- Modelo original tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
- Codigo de tiny-voca: https://github.com/n4ze3m/tiny-voca
- CATT (diacritizacion): https://github.com/abjadai/catt
