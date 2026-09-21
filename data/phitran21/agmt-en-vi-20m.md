# Phitran21/agmt-en-vi-20m

## Resumen

AGMT v3.2 (Adaptive/Elastic Recurrent Translation Architecture) es un modelo experimental de traduccion automatica ingles ↔ vietnamita desarrollado por Tran Tuan Phi (Vietnam), publicado en HuggingFace bajo el identificador `Phitran21/agmt-en-vi-20m`. Su propuesta central no es un nuevo bloque neuronal, sino una politica de computacion adaptativa: el modelo parte de una codificacion base no recurrente y aplica despues un refinador recurrente con pesos compartidos, decidiendo mediante un router si merece la pena ejecutar un paso adicional de refinamiento (REFINE) o detenerse (HALT).

La arquitectura combina componentes conocidos (tokenizacion subword compartida, embeddings compartidos, codificacion/decodificacion de estilo Transformer, caminos residuales y decodificacion autoregresiva) con innovaciones de composicion: un "lexical highway" que preserva evidencia superficial del texto fuente, un "stable memory bridge" que alimenta al decoder con tres flujos de informacion (`H_refined`, `H_base`, `E_lex`) y el router de valor de traduccion. El resultado se distribuye como un conjunto de cuatro grafos ONNX mas un runtime de inferencia en Python, con el tokenizador SentencePiece embebido en Base64 dentro del propio script.

El modelo es relevante como pieza de investigacion sobre computacion elastica en traduccion: la profundidad efectiva de computo se controla en tiempo de inferencia con el parametro `r` (numero de pasos de refinamiento ejecutados) sin anadir pesos nuevos. Se trata, sin embargo, de un artefacto de muy baja difusion (0 descargas, 1 like en el momento de la consulta) y con documentacion incompleta: no se declaran datos de entrenamiento, benchmarks ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder base no recurrente (Prelude) + refinador recurrente con pesos compartidos + router adaptativo HALT/REFINE + lexical highway + stable memory bridge + decoder autoregresivo poco profundo |
| Parametros totales | ~20 M (segun el sufijo del nombre del repositorio; no confirmado de forma explicita en la model card) |
| Parametros activos | No aplica: no es un modelo MoE. El refinador reutiliza el mismo conjunto de pesos en cada paso recurrente |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen grafos ONNX; la model card no documenta cuantizacion ni precision de pesos) |
| Idiomas soportados | Ingles (en) y vietnamita (vi), traduccion bidireccional mediante token de direccion |
| Licencia | No disponible |
| Formato de pesos | ONNX (`base.onnx`, `refine.onnx`, `router.onnx`, `decode.onnx`) + runtime `translate.py`; tokenizador SentencePiece serializado en Base64 embebido en el script |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | `translation` |
| Decodificacion | Autoregresiva con decodificacion voraz (greedy) en el runtime proporcionado |

## Arquitectura y entrenamiento

El flujo de computo descrito en la model card es el siguiente: el texto fuente pasa por un tokenizador SentencePiece compartido y un embedding compartido; desde ahi se bifurca un "lexical highway" que conserva evidencia superficial (nombres, numeros, identificadores tecnicos) y la rama principal que atraviesa el Prelude Encoder para producir `H_base`. Sobre `H_base` actua el refinador recurrente compartido, que aplica la misma transformacion aprendida en cada paso segun un identificador de etapa: `H_(r+1) = Refiner(H_r, step=r)`. Esto implica que el numero de parametros almacenados no equivale a la profundidad efectiva de computo: aumentar `r` no anade pesos, solo repite la transformacion compartida.

El router de valor de traduccion se ejecuta antes de cada paso adicional y predice el valor marginal esperado del refinamiento a partir del estado actual, su cambio, la longitud de la entrada, el paso de recurrencia y la direccion de traduccion. Si ese valor predicho no supera el "precio de computo" activo, el modelo emite HALT y no ejecuta refinamiento especulativo. El decoder no consume unicamente el estado final refinado: recibe tres flujos (`H_refined`, `H_base` y `E_lex`) a traves del stable memory bridge, con el objetivo declarado de reducir la perdida de informacion acumulada en refinamientos sucesivos y de mantener una interfaz de decoder estable ante distintas profundidades de recurrencia. El autor es explicito al senalar que AGMT es en parte arquitectura nueva y en parte recomposicion de ideas existentes, y advierte de que un `r` mayor no implica automaticamente mejor traduccion.

No hay informacion disponible sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o fine-tuning supervisado adicional. Tampoco se documentan hiperparametros de entrenamiento ni el coste computacional del mismo.

## Capacidades

- Traduccion automatica bidireccional ingles → vietnamita y vietnamita → ingles, con token de direccion para seleccionar el idioma destino.
- Computacion adaptativa en inferencia: modos `fast` y `balanced` en los que el router decide dinamicamente si detenerse o refinar.
- Refinamiento recurrente con pesos compartidos: la profundidad de computo efectiva se ajusta con el parametro `r` sin incrementar el numero de pesos.
- Preservacion de evidencia lexica superficial mediante el lexical highway (nombres propios, cifras, identificadores tecnicos).
- Tokenizacion subword compartida para ambos idiomas y ambas direcciones, con SentencePiece embebido en el propio runtime.
- Inferencia autonoma y autocontenida: no requiere ficheros externos de tokenizador si se conserva `_SPM_B64` en `translate.py`.
- Capacidades no disponibles o no declaradas: no se documenta soporte de tool calling / function calling, ni comportamiento agentico, ni razonamiento multi-paso, ni modo "thinking", ni vision, ni audio, ni generacion de codigo o matematicas como capacidades especificas.
- Cobertura multilingue limitada a los dos idiomas declarados (en, vi); no hay indicacion de transferencia a otras lenguas.

## Casos de uso

- Traduccion de documentacion tecnica en-vi: el lexical highway esta disenado para conservar identificadores, nombres de funciones y cifras, lo que encaja con manuales, fichas de API y notas de version donde los terminos literales no deben alterarse.
- Localizacion de interfaces y cadenas de producto: el par en-vi y el tamano reducido del modelo permiten ejecutarlo en el propio backend de una aplicacion sin depender de una API externa de traduccion.
- Procesamiento por lotes de corpus en-vi: al distribuirse como grafos ONNX, puede integrarse en pipelines de preprocesamiento de datos para construir datasets paralelos o traducir grandes volumenes de texto de forma offline.
- Investigacion en computacion elastica: el modelo sirve como banco de pruebas para estudiar politicas HALT/REFINE, el equilibrio entre coste y calidad de traduccion, y el efecto de variar `r` sobre la salida final.
- Traduccion en dispositivos con recursos limitados: con ~20 M de parametros y un repositorio de 0,1 GB, es candidato para entornos de edge o de CPU sin GPU dedicada, siempre que la latencia resultante sea aceptable.
- Prototipado rapido de sistemas de traduccion multilingue que despues se escalen a modelos mayores: permite validar la integracion, el formato de entrada/salida y la logica de enrutamiento antes de invertir en modelos de cientos de millones de parametros.
- Traduccion de contenido generado por usuarios en comunidades vietnamitas de habla inglesa, como foros o soporte tecnico, con la advertencia de que la calidad no esta verificada por benchmarks publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye BLEU, chrF, COMET ni ninguna otra metrica de traduccion, ni comparaciones cuantitativas con modelos de referencia. Tampoco se documentan mediciones de latencia o throughput, ni curvas que relacionen el numero de pasos de refinamiento `r` con la calidad de la traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmetica a partir del tamano declarado (~20 M de parametros), los pesos ocuparian del orden de 80 MB en FP32 y unos 20 MB en INT8; a ello habria que sumar el estado de activaciones y la cache de decodificacion, no cuantificados en la documentacion.
- GPU recomendadas: no disponibles. Por tamano, el modelo es viable en cualquier GPU con unos pocos cientos de MB libres, e incluso en GPU integradas.
- Compatibilidad con GPU de consumo: si, previsiblemente cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) e incluso en equipos sin GPU dedicada. Esta afirmacion se basa en el tamano declarado, no en pruebas publicadas.
- Opciones de despliegue: el runtime oficial es `translate.py` con ONNX Runtime, requiriendo los cuatro grafos (`base.onnx`, `refine.onnx`, `router.onnx`, `decode.onnx`) en el mismo directorio. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; al ser un modelo de traduccion especifico con grafos ONNX personalizados, estos runners genericos no serian aplicables sin conversion adicional.
- Latencia y throughput estimados: no disponibles. Los modos `fast` y `balanced` sugieren un compromiso explicito entre coste de computo y calidad, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| AGMT v3.2 en-vi | ~20 M (segun nombre del repo) | No disponible | en ↔ vi | No disponible | ONNX + runtime Python | HuggingFace, 0 descargas |
| Helsinki-NLP opus-mt-en-vi | Del orden de decenas de millones (dato aproximado, no verificado en esta busqueda) | No disponible | en → vi | Consultar model card de origen | PyTorch / Marian | Ampliamente utilizado en pipelines de traduccion |
| NLLB-200 distilled 600M | 600 M (dato aproximado, no verificado en esta busqueda) | No disponible | 200 idiomas, incluye en y vi | CC-BY-NC-4.0 (uso no comercial; verificar) | PyTorch / safetensors | Meta, muy extendido |
| EnViT5 | Cientos de millones de parametros segun variante | No disponible | en ↔ vi | Consultar model card de origen | PyTorch | Especifico para ingles-vietnamita |

No se dispone de datos de rendimiento comparativo entre AGMT y estas alternativas en la informacion proporcionada, por lo que la tabla solo recoge caracteristicas estructurales, no calidad de traduccion. Cualquier eleccion entre ellos deberia apoyarse en una evaluacion propia sobre el dominio objetivo.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad de traduccion (BLEU, chrF, COMET) que permita situar el modelo frente a alternativas establecidas.
- Licencia no declarada: al no especificarse licencia en la model card ni en los metadatos, no puede asumirse permiso para uso comercial. Es necesario contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion y de deriva semantica: el propio autor advierte que un paso de refinamiento adicional puede mejorar, preservar o degradar la traduccion, lo que introduce variabilidad en la salida segun el valor de `r` y la decision del router.
- Documentacion de entrenamiento inexistente: se desconocen el corpus, el volumen de tokens, la composicion del dataset y si hubo alineacion posterior, lo que impide evaluar sesgos sistematicos o dominios mal cubiertos.
- Cobertura limitada a dos idiomas: no hay soporte declarado para otras lenguas ni evidencia de transferencia cross-lingue.
- Longitud de contexto desconocida: no se especifica la ventana maxima, por lo que el comportamiento con documentos largos no esta garantizado.
- Decodificacion unicamente voraz en el runtime publicado: no se documentan busqueda por haz, muestreo ni penalizaciones, lo que limita la exploracion de alternativas de decodificacion.
- Modelo experimental y practicamente sin adopcion: 0 descargas y 1 like en el momento de la consulta, sin comunidad que reporte errores ni casos de uso validados.
- Dependencia de un detalle fragil del runtime: el tokenizador SentencePiece esta embebido en Base64 dentro de `translate.py`; eliminar `_SPM_B64` o alterar el script sin reemplazar el cargador rompe la inferencia.
- Idiomas y variantes: no se especifica que variante del vietnamita (por ejemplo, diferencias de registro o dialectos del sur y del norte) cubre el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Phitran21/agmt-en-vi-20m
- Facebook del autor: https://www.facebook.com/share/1HerWkmghN
- Correo del autor: phihhhhhhhhhh@gmail.com
- Papers, blogs, repositorios adicionales o demos: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
