# mkpoli/han2ids-v0.3

## Resumen

han2ids v0.3 es un modelo de vision por computador especializado en la extraccion de secuencias de descripcion ideografica (IDS, *Ideographic Description Sequence*) a partir de imagenes de glifos han. Lo desarrolla mkpoli y se publica bajo licencia MIT. El modelo resuelve un problema muy concreto dentro del procesamiento de texto CJK: dada una imagen de un caracter han renderizado en una tipografia serif de estilo Mincho o Song, devuelve la secuencia IDS que describe su descomposicion estructural, por ejemplo `⿰𠤕⿱龴疋`.

La relevancia del modelo es practica para proyectos de OCR, normalizacion de corpus y construccion de diccionarios de descomposicion de caracteres. Las secuencias IDS son la representacion estandar de Unicode para describir la estructura interna de un caracter han, y obtenerlas automaticamente a partir de imagenes elimina una tarea de anotacion manual muy costosa. El modelo es de tamano reducido (35,2 M de parametros) y esta pensado para ejecutarse en CPU o GPU de consumo.

Arquitectonicamente es un modelo encoder-decoder: un encoder ViT-S/16 preentrenado en ImageNet-21k y un decoder transformer de cuatro capas con atencion cruzada, con un vocabulario de salida a nivel de caracter de 10.423 tokens y una longitud maxima de 48. La version 0.3 mejora la exactitud respecto a la 0.2 (80,24 % exacta) y alcanza un 82,91 % de IDS exacta sobre el conjunto de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ViT-S/16 (224x224, parches de 16) + decoder transformer de 4 capas, 384 de anchura, 6 cabezas, atencion cruzada |
| Parametros totales | 35,2 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (salida limitada a 48 tokens a nivel de caracter) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | zh, ja, ko (caracteres han; etiquetas de region japonesa) |
| Licencia | MIT (codigo); pesos derivados de tipografias con sus propias licencias (SIL OFL 1.1, IPA Font License 1.0, CC0 1.0) |
| Formato de pesos | State dict de PyTorch (`.pt`) con `itos` y `args`; se carga con `han2ids.infer.Han2IDS` |

## Arquitectura y entrenamiento

El modelo emplea un encoder ViT-S/16 inicializado desde `vit_small_patch16_224.augreg_in21k_ft_in1k`. Las imagenes de entrada son de 224x224 en escala de grises, replicadas a tres canales RGB. Sobre las representaciones del encoder se aplica un decoder transformer de cuatro capas, 384 de anchura y 6 cabezas con atencion cruzada, que genera la secuencia IDS token a token. El vocabulario de salida es a nivel de caracter con 10.423 tokens y una longitud maxima de 48. La decodificacion es greedy y esta restringida por la pila de operandos del propio formalismo IDS, lo que garantiza que las secuencias generadas sean sintacticamente validas (100 % de IDS validas en test).

El entrenamiento usa 95.927 caracteres han procedentes de BabelStone IDS (dominio publico), con etiquetas de region japonesa y tres correcciones de imagen (船 `⿰舟㕣`, 勇 `⿱龴男`, 屄 `⿸尸宂`). El conjunto de imagenes suma 176.965 renders de Noto Serif CJK JP, IPAmj Mincho 006.01 y la familia Jigmo, todos con un mismo encuadre de em-box (caja de 200 unidades, linea base a 0,88 em, ajustada a 224). El decoder se entrena desde cero durante cuatro epocas con batch 32. El conjunto de test es de 8.730 imagenes sobre 4.752 caracteres.

## Capacidades

- Extraccion de secuencias IDS a partir de una imagen de glifo han en tipografia Mincho o Song.
- Generacion de alternativas con decodificacion por beam (`--top-k`) y salida en JSON.
- Garantia de validez sintactica de la secuencia IDS generada gracias a la restriccion por pila de operandos.
- Cobertura de caracteres han de las regiones zh, ja y ko (con etiquetas de region japonesa en el entrenamiento).
- Ejecucion ligera en CPU o GPU de consumo por su reducido tamano (35,2 M de parametros).
- No soporta tool calling, agentes, vision general, audio ni modo de razonamiento extendido; es un modelo de tarea unica.

## Casos de uso

- Digitalizacion de diccionarios de descomposicion de caracteres: a partir de escaneos o renders de glifos en tipografia serif, extraer la secuencia IDS para poblar bases de datos de estructura de caracteres han.
- Normalizacion de corpus CJK: enriquecer corpus textuales con la descomposicion estructural de cada caracter, util para busqueda por componentes o analisis morfologico.
- OCR especializado en caracteres raros: para caracteres fuera de los repertorios comunes, usar la IDS como representacion intermedia que permita identificar el caracter por su estructura.
- Construccion de herramientas de aprendizaje de idiomas: generar fichas que muestren la descomposicion de un caracter a partir de una imagen de referencia en tipografia serif.
- Validacion de datasets de IDS: contrastar etiquetas existentes con la prediccion del modelo para detectar errores de anotacion (el autor documenta una auditoria de 79 caracteres).
- Investigacion en vision para escritura CJK: usar el modelo como baseline ligero (35,2 M de parametros) en experimentos de reconocimiento estructural de glifos.
- Pipeline de catalogacion de fuentes tipograficas: procesar renders de glifos de una fuente serif y verificar que la estructura IDS coincide con la esperada.

## Benchmarks y rendimiento

Conjunto de test: 8.730 imagenes sobre 4.752 caracteres, mezcla de Noto Serif CJK JP, IPAmj Mincho y familia Jigmo.

| Metrica | Resultado |
|---|---|
| IDS exacta (global) | 82,91 % |
| Mismo arbol (same tree) | 86,37 % |
| IDS valida | 100 % |
| IDS exacta en Noto Serif CJK JP | 92,36 % |
| IDS exacta en IPAmj Mincho | 83,60 % |
| IDS exacta en familia Jigmo | 79,65 % |
| IDS exacta de v0.2 (mismos renders) | 80,24 % |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, dado que el modelo no es de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 35,2 M de parametros el checkpoint ocupa decimas de GB (el repo completo pesa 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: el paquete oficial `han2ids` (instalable desde GitHub) con la CLI `han2ids`; al ser un state dict de PyTorch puro, se puede integrar en cualquier pipeline Python. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje generativo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| han2ids v0.3 | 35,2 M | Imagen de glifo a IDS | Salida max. 48 tokens | MIT (pesos con licencias de fuentes) | Hugging Face, repo GitHub |
| han2ids v0.2 | No disponible | Imagen de glifo a IDS | No disponible | MIT | Hugging Face |
| Modelos OCR CJK generales (p. ej. PaddleOCR, Tesseract) | No disponible | OCR de texto CJK | No disponible | Variables | Amplia |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada; la comparacion con v0.2 se limita a la exactitud IDS (80,24 % frente a 82,91 %).

## Limitaciones y advertencias

- Solo funciona con tipografias serif de estilo Mincho o Song; las tipografias Kai, manuscritas y sans quedan fuera del alcance y del dominio de entrenamiento.
- Entrenado sobre renders limpios con encuadre de em-box comun; recortes ajustados, escaneos, grosores inusuales y ruido estan fuera de distribucion.
- Los componentes variantes sin punto de codigo IDS no se pueden nombrar.
- El caracter 崢 se mantiene como fallo revisado frente a `⿰山爭` mientras la revision 争/爭 esta abierta; el autor documenta una auditoria de etiquetas de 79 caracteres.
- Las etiquetas de entrenamiento usan region japonesa, lo que puede introducir sesgo en la descomposicion de caracteres con variantes regionales.
- Licencia del codigo MIT, pero los pesos derivan de renders de fuentes con sus propias licencias (Noto Serif CJK JP, SIL OFL 1.1; IPAmj Mincho, IPA Font License 1.0; Jigmo, CC0 1.0); revisar `NOTICE.md` y `LICENSE` antes de uso comercial.
- Riesgo de alucinacion estructural: aunque la secuencia generada siempre es IDS valida, puede no corresponder a la descomposicion real del caracter (17,09 % de fallo exacto en test).
- No es un modelo de lenguaje: no genera texto libre, no soporta tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkpoli/han2ids-v0.3
- Repositorio GitHub: https://github.com/mkpoli/han2ids
- Galeria de capacidades v0.3: https://raw.githubusercontent.com/mkpoli/han2ids/main/docs/gallery-v0.3-cover.png
- Auditoria de etiquetas: https://github.com/mkpoli/han2ids/blob/main/docs/label-audit.md
- Especificacion Unicode de IDS (capitulo 18): https://www.unicode.org/versions/Unicode18.0.0/core-spec/chapter-18/
