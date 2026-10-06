# PureOne/AHTI-NEXIFORM-1.0.0

## Resumen

AHTI / NEXIFORM 1.0.0 es una publicacion de investigacion y software cientifico, no un modelo de lenguaje ni una red neuronal. Lo desarrolla el usuario PureOne (con credito creativo solicitado a "Artificial Hyperintelligence Eve") y resuelve un problema concreto de geometria computacional: dada una descomposicion de Hodge ponderada de un campo incremental sobre un complejo de cocadenas finito, encontrar la reparacion optima cuyo componente armonico se cuantiza a periodos enteros, con certificados verificables de optimalidad algebraica y de validez geometrica.

El marco demuestra, bajo hipotesis declaradas, que el minimo ponderado se descompone como la suma del termino de incompatibilidad local y un problema de vector mas cercano sobre el reticolo de periodos armonicos integrales. Sobre esa base implementa reconstruccion determinista de marcos 3D no singulares a partir de momentos simetricos de segundo y cuarto orden (con un maximo de trece sondas de contraccion en aritmetica exacta), cohomologia integral saturada con torsion mediante transformaciones de Smith verificadas, certificados racionales de no-inversion de Jacobianos y una cota de inyectividad global suficiente.

Es relevante ahora para investigadores en mallado hexaedrico, parametrizacion volumetrica y topologia computacional porque separa explicitamente lo demostrado de lo abierto: el autor advierte que el alcance implementado son complejos finitos con un sistema local plano especificado y que no constituye un generador universal de mallas hexaedricas ni una prueba de mallabilidad sin restricciones. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano declarado del repositorio es de 0.0 GB (la model card indica que el artefacto principal es `paper/AHTI_1.0.0.pdf`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Framework matematico-computacional ejecutable sobre complejos de cocadenas finitos `C0 ->B C1 ->C C2` con `CB=0`: descomposicion ortogonal ponderada, cohomologia integral saturada, busqueda exacta de vector mas cercano en reticulos y certificados de validez geometrica |
| Parametros totales | No disponible (no aplica: no hay pesos neuronales) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantizacion | No aplica. El paquete usa aritmetica racional exacta y validacion en coma flotante; no cuantiza pesos |
| Idiomas soportados | No disponible |
| Licencia | `ahti-mixed-mit-cc-by-4.0` (aparece como `other` en HuggingFace; nombre declarado: licencia mixta MIT + CC BY 4.0) |
| Formato de pesos | No aplica. Artefactos: `paper/AHTI_1.0.0.pdf`, codigo Python, tests y salidas legibles por maquina en `reports/` |
| Version y fecha de publicacion | 1.0.0, 2026-10-05 |
| Fecha del repositorio | Creado y actualizado el 2026-10-06 |
| Estado de revision | Publicacion de investigacion/software autocontenida; no revisada por pares de forma independiente |
| Requisitos de ejecucion | Python 3.11 o superior |
| Tamano del repositorio | 0.0 GB |
| Tarea declarada (pipeline) | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento ni datos de entrenamiento: es un paquete de software con demostraciones formales. El nucleo matematico es la descomposicion ortogonal ponderada de un campo incremental `a = e + h + l`, donde `e` pertenece a la imagen del operador `B` (componente exacta), `h` concentra la componente armonica/cohomologica global y `l` es la incompatibilidad local. Si `LZ^r` es el reticolo construido de periodos armonicos integrales, el resultado principal es `min ||a-b||_W^2 = ||l||_W^2 + min_{k en Z^r} ||h - Lk||_W^2` sobre los `b` con `Cb=0` y clase integral, y el campo reparado optimo se reconstruye a partir de una solucion exacta de vector mas cercano. Cuando ese minimizador algebraico satisface ademas las condiciones de validez geometrica declaradas, resulta automaticamente globalmente optimo sobre el subconjunto geometricamente admisible, porque alcanza la cota inferior algebraica sin restringir.

Los componentes implementados en esta version incluyen: reconstruccion determinista de un 3-marco no singular desde sus momentos simetricos de segundo y cuarto orden (maximo de trece sondas de contraccion en aritmetica exacta, con validacion opcional de sexto orden); testigos de momentos racionales exactos cuando la reconstruccion con denominador acotado tiene exito; una metrica de retroceso momento-coordenada que reproduce la variacion de marco de Frobenius ordinaria sobre la variedad de momentos regulares; emparejamiento exacto de caras propias y adaptador de marco ordinario regular; descomposicion de Hodge racional ponderada en componentes exacta, armonica e incompatibilidad local; cohomologia integral saturada con torsion mediante transformaciones de Smith verificadas; busqueda exacta de vector mas cercano con comportamiento explicito ante limites de recursos; reduccion de Schur/reticulo con restriccion de frontera; metricas jacobianas tetraedricas; certificados racionales de no-inversion para una ruta de reparacion recta completa; y un certificado suficiente de inyectividad global relativo a una aplicacion de referencia convexa biyectiva conocida. No se especifica ningun uso de RLHF, DPO ni ajuste por refuerzo.

## Capacidades

- Calculo de la reparacion algebraica optima de un campo incremental sobre un complejo de cocadenas finito con sistema local plano especificado, con cota inferior exacta.
- Optimizacion de periodo entero en un sector fijo sobre el reticolo `LZ^r` de periodos armonicos integrales.
- Reconstruccion determinista de marcos 3D no singulares a partir de momentos simetricos de segundo y cuarto orden, con un maximo de trece sondas de contraccion en aritmetica exacta.
- Validacion opcional mediante momentos de sexto orden.
- Emision de testigos de momentos racionales exactos cuando la busqueda con denominador acotado finaliza con exito.
- Descomposicion de Hodge racional ponderada en componentes exacta, armonica e incompatibilidad local.
- Calculo de cohomologia integral saturada con torsion mediante transformaciones de Smith verificadas (ejemplo incluido: cohomologia del circulo trenzado `Z/2 + Z/2 + Z`).
- Emparejamiento exacto de caras propias y adaptador de marco ordinario regular.
- Busqueda exacta de vector mas cercano con notificacion explicita de limite de recursos (`ResourceLimit`).
- Reduccion de Schur/reticulo con restriccion de frontera.
- Metricas jacobianas tetraedricas y certificados racionales de no-inversion (minores positivos) para una ruta de reparacion recta completa.
- Certificado suficiente de inyectividad global relativo a una aplicacion de referencia convexa biyectiva conocida (cota inferior de Lipschitz `99/100` en el ejemplo convexo explicito).
- No se declaran capacidades de generacion de texto, razonamiento en lenguaje natural, codigo, vision, audio, tool calling ni agentes.

## Casos de uso

- Reparacion de campos de parametrizacion volumetrica: dado un campo incremental con componente armonica no integral, el paquete calcula la cuantizacion de periodo entero de coste minimo (por ejemplo, coste `4/25` en el ejemplo de periodo integral mas cercano), lo que permite obtener una parametrizacion globalmente consistente antes de extraer la malla.
- Generacion de mallas hexaedricas como paso previo: se usa la descomposicion exacta/armonica/local para decidir si una base de campo es integrable y, en caso contrario, repararla; encaja en pipelines de mallado estructurado donde la integrabilidad global es el cuello de botella. El autor advierte que no es un generador universal de mallas hexaedricas.
- Validacion de no-inversion de mallas tetraedricas: los certificados racionales de minores positivos permiten garantizar que una ruta de reparacion recta no introduce elementos invertidos, utilizable como puerta de calidad antes de escribir la malla en produccion.
- Verificacion de herramientas de geometria en CI/CD: integrar `python -m unittest discover -s tests -v` y `python -m ahti examples/twisted_circle.json --output certificate.json` como comprobaciones reproducibles de que una implementacion propia de cohomologia o de Hodge coincide con los resultados exactos de referencia.
- Auditoria de certificados geometricos: interpretar las etiquetas emitidas (`exact_algebraic_optimum_for_declared_cochain_problem`, `floating_point_reconstruction_checked`, `exact_rational_moment_witness`, `ResourceLimit`) para decidir que afirmaciones pueden usarse en un informe tecnico y cuales quedan fuera de alcance.
- Reconstruccion de marcos en procesado geometrico: recuperar un 3-marco no singular desde sus momentos de segundo y cuarto orden en lugar de almacenar el marco completo, con validacion opcional de sexto orden y testigos racionales exactos.
- Investigacion reproducible en topologia computacional: calcular cohomologia integral saturada con torsion mediante transformaciones de Smith verificadas y comparar con los ejemplos exactos publicados en `reports/`.
- Material docente de geometria diferencial discreta: los ejemplos exactos (coste de reparacion `1/48000` en el caso ruidoso de dos tetraedros con periodo cero, coste con restriccion de frontera `3/50`) sirven como casos resueltos verificables en cursos de geometria discreta y de Rham.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. En concreto, no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar de modelos de lenguaje, ya que no se trata de un modelo de lenguaje. Los unicos datos de rendimiento declarados son los de verificacion del propio paquete:

| Metrica de verificacion | Valor declarado |
|---|---|
| Tests declarados superados | 35/35 |
| Reconstrucciones numericas de marco (con semilla) | 80 |
| Error de orbita maximo observado en la ejecucion registrada | ~3.462e-15 (resultado de test en coma flotante, no teorema de estabilidad) |
| Cohomologia integral del circulo trenzado | `Z/2 + Z/2 + Z` |
| Coste de reparacion de periodo integral mas cercano | 4/25 |
| Coste de reparacion de periodo cero (dos tetraedros con ruido) | 1/48000 |
| Minores racionales positivos de no-inversion en esa reparacion | Positivos (certificado emitido) |
| Cota inferior de Lipschitz global certificada (ejemplo convexo explicito) | 99/100 |
| Coste de reparacion con restriccion de frontera | 3/50 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. No hay pesos ni inferencia neuronal; no se declara requisito de GPU en la informacion disponible.
- GPU recomendadas: no disponible. No se especifica ninguna GPU (A100, H100, RTX 4090 u otras).
- Ejecucion en GPU de consumo: no aplica en el sentido de inferencia de un modelo; el paquete es codigo Python 3.11+ con dependencias fijadas.
- Opciones de despliegue: instalacion local con `python -m pip install -r requirements.txt`; ejecucion de la suite con `python -m unittest discover -s tests -v`; demo con `python examples/run_demo.py`; CLI con `python -m ahti examples/twisted_circle.json --output certificate.json`; en Windows, `RUN_ALL.bat` crea el entorno virtual, instala dependencias fijadas, ejecuta los tests y genera los ejemplos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Si se documenta un comportamiento relevante: la busqueda exacta de vector mas cercano puede no completarse bajo el limite de trabajo configurado, en cuyo caso devuelve `ResourceLimit` y no emite ninguna afirmacion de optimalidad.
- Almacenamiento: el repositorio ocupa 0.0 GB segun HuggingFace.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye alternativas comparables y el artefacto no pertenece a la categoria de modelos de lenguaje ni de modelos generativos, por lo que no procede comparar parametros, contexto, rendimiento ni licencia contra LLM. Como referencia de categoria, el propio autor lo situa en el ambito de la geometria computacional, el mallado hexaedrico y la topologia computacional, pero no se ofrecen comparaciones con otras bibliotecas o publicaciones del sector.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes.
- Estado de revision: publicacion de investigacion/software autocontenida, explicitamente no revisada por pares de forma independiente.
- Alcance acotado: el ambito implementado son complejos finitos con un sistema local plano especificado. No es un generador universal de mallas hexaedricas ni una prueba de mallabilidad sin restricciones; la model card se corta precisamente al enumerar lo no establecido ("Not established are unrestricted hex-meshability, automatic gl..."), por lo que esa lista puede estar incompleta en la informacion disponible.
- Alcance de los certificados: `exact_algebraic_optimum_for_declared_cochain_problem` no certifica por si mismo la inyectividad de la malla; `floating_point_reconstruction_checked` no convierte una entrada en coma flotante ruidosa en un teorema exacto; el fallo de la busqueda con denominador acotado no excluye soluciones irracionales o con denominadores mayores; `ResourceLimit` implica que no se reclama optimalidad; y el fallo de una desigualdad geometrica suficiente significa "no certificado", no necesariamente "geometricamente invalido".
- El error de orbita de ~3.462e-15 es un resultado de test en coma flotante y no un teorema de estabilidad universal.
- Idiomas soportados: no disponible. La documentacion disponible esta en ingles.
- Licencia: se declara una licencia mixta `ahti-mixed-mit-cc-by-4.0` (MIT + CC BY 4.0) y HuggingFace la etiqueta como `other`. No se detalla en la informacion disponible que partes cubre cada componente; hay que consultar el archivo `LICENSE` antes de cualquier uso comercial. MIT y CC BY 4.0 permiten uso comercial, pero CC BY 4.0 exige atribucion, y el autor solicita ademas una atribucion creativa concreta ("Artificial Hyperintelligence Eve, wife of Maciej Nowicki").
- Adopcion y soporte: 0 descargas y 0 likes, repositorio de 0.0 GB, sin comunidad, sin issues documentados y sin mantenimiento declarado. El riesgo de continuidad del proyecto es alto.
- Idoneidad para produccion: no hay evidencia de uso en produccion, ni benchmarks externos, ni estudios de escalado mas alla de los ejemplos exactos publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PureOne/AHTI-NEXIFORM-1.0.0
- Licencia: https://huggingface.co/PureOne/AHTI-NEXIFORM-1.0.0/blob/main/LICENSE
- Manuscrito principal (referencia relativa de la model card): `paper/AHTI_1.0.0.pdf`
- Salidas legibles por maquina: directorio `reports/` del repositorio
- Demo y ejemplos: `examples/run_demo.py`, `examples/twisted_circle.json`
- Script de ejecucion completa en Windows: `RUN_ALL.bat`
- No se han encontrado otros enlaces (papers externos, blogs, repositorios o demos) en la informacion disponible.
