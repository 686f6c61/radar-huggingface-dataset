# c0mbatduckzz/TOM-MAKTUBIII

## Resumen
TOM-MAKTUBIII no es un modelo de lenguaje neuronal al uso: es un modelo simbólico ejecutable que implementa el formalismo descrito en el documento *Maktub III: Signature-field kinematic calculus*, atribuido a Tom Klootwijk. Se distribuye como paquete Python (versión 3.0.0, publicada el 10 de octubre de 2026) bajo el identificador `c0mbatduckzz/TOM-MAKTUBIII` en HuggingFace, con la librería personalizada `tom-maktubiii` y un tamaño de repositorio de 0,0 GB. No contiene pesos entrenados, ni dataset de entrenamiento, ni ejecución de entrenamiento: es código con reglas numéricas explícitas y deterministas.

El modelo implementa una arquitectura de "estado y regla" emparejada, con operadores de cáscara (shell operators) primitivos, campos con signo, composición de Hadamard, adaptadores de cartas de Klein, enrutamiento de Fourier con doble pin, coordenadas logarítmicas de tiempo, direccionamiento de 25 sitios y un registro de transacciones indexado por tiempo denominado Power Paper T. Cada transición calcula dos sucesores a partir de la misma instantánea previa al evento: el estado siguiente mediante `Act` y la descripción siguiente mediante `Rewrite`.

Su relevancia es acotada y de carácter investigador: no compite con modelos generativos, sino que sirve como referencia ejecutable y reproducible de un formalismo matemático concreto, con validación parcial declarada por el propio autor. La licencia es propietaria, sin concesión de derechos, lo que limita drásticamente cualquier uso más allá de la lectura del código y su reproducción con fines de verificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Simbólica determinista de estado y regla emparejados; no es un transformer ni una red neuronal |
| Parametros totales | no disponible (no existen pesos aprendidos; el modelo no tiene parámetros en el sentido habitual) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no hay ventana de contexto; el estado se define por eventos y snapshots) |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | en, nl (según metadatos; el código y la documentación están en inglés) |
| Licencia | Propietaria, todos los derechos reservados, sin licencia concedida (no open source, no permisiva, no Creative Commons) |
| Formato de pesos | no disponible (no hay pesos; el paquete se instala como código Python, con PDFs originales incluidos con procedencia SHA-256) |

## Arquitectura y entrenamiento
La arquitectura es un formalismo simbólico ejecutable, no una red neuronal. Se compone de operadores de cáscara primitivos que declaran su portador, métrica, unidades, representación e identidad, y exponen un método `evaluate(point, time)` que devuelve el valor del campo. Los muestreadores de distancia con signo y de forma con signo pueden participar como entradas de primera clase, y el usuario puede definir primitivas propias sin que estas deban reducirse al ejemplo de círculo incluido. La composición se realiza mediante producto de Hadamard, y los adaptadores `KleinPullback` aceptan mapas de coordenadas suministrados, con una comprobación `check_klein_seams` de las dos relaciones de costura del cociente sobre una rejilla de muestras declarada.

No existe entrenamiento, dataset ni ajuste por RLHF o DPO: el propio autor indica que el modelo no tiene pesos aprendidos ni ejecución de entrenamiento. La innovación técnica declarada es la semántica transaccional emparejada: cada evento produce simultáneamente el estado sucesor y la descripción sucesora a partir de la instantánea previa, de modo que la descripción actual selecciona las compuertas actuales y una reescritura solicitada pasa a estar activa en el evento siguiente. La lectura finalizada incluye tanto la descripción aplicada como la siguiente, conectadas al estado sucesor mediante un identificador de registro acíclico. El paquete incluye rutinas de referencia de Fourier con subtransformadas directas de coste O(N²), que exponen el álgebra en lugar de ofrecer una FFT de alto rendimiento, además de la regla de la cadena temporal, la transformada de Hadamard normalizada, la DFT directa, la mariposa inversa, la DFT inversa y la reconstrucción completa de muestras retenidas.

## Capacidades
- Ejecución determinista de transiciones de estado y regla emparejadas, con cálculo de ambos sucesores desde la misma instantánea previa al evento.
- Evaluación de operadores de cáscara primitivos definidos por el usuario, con portador, métrica, unidades, representación e identidad declarados.
- Composición de operadores mediante producto de Hadamard y evaluación de campos con signo resultantes.
- Adaptadores de cartas de Klein con mapas de coordenadas suministrados y verificación de relaciones de costura sobre rejillas de muestras.
- Enrutamiento de Fourier con doble pin, transformada de Hadamard normalizada, DFT directa e inversa, mariposa inversa y reconstrucción de muestras.
- Direccionamiento de 25 sitios y coordenadas logarítmicas de tiempo.
- Registro de transacciones Power Paper T indexado por tiempo, con identificadores de registro acíclicos.
- Carga de configuración remota opcional mediante `huggingface_hub>=0.25`, con posibilidad de fijar una revisión por SHA de commit.
- No dispone de generación de texto, razonamiento, código, matemáticas generales, visión, audio, tool calling, agentes ni capacidades multilingües en el sentido de los modelos generativos.

## Casos de uso
- Verificación de un formalismo matemático: el paquete reproduce el ejemplo de la página 23 (clave local 11, ruta de búsqueda binaria 12 → 5 → 8 → 10 → 11, canales con compuerta (0,1; −0,15) y salida mixta −0,05), lo que permite comprobar la implementación contra el documento original.
- Docencia e investigación en geometría computacional simbólica: los operadores de cáscara, los campos de distancia con signo y la composición de Hadamard sirven para experimentar con representaciones de formas y campos escalares sin depender de aprendizaje automático.
- Estudio de arquitecturas de estado y regla: el modelo ofrece una implementación de referencia de la semántica de reescritura diferida, útil para quienes investigan sistemas de transición con descripciones mutables.
- Reproducción de rutinas de Fourier y Hadamard: las implementaciones directas O(N²) permiten validar resultados algebraicos en entornos donde la corrección prima sobre el rendimiento.
- Pruebas de procedencia y trazabilidad: los PDFs originales se incluyen con hashes SHA-256 y el registro de transacciones aporta un rastro acíclico, lo que resulta apropiado para auditorías de reproducibilidad.
- Prototipado de adaptadores geométricos: `KleinPullback` y `check_klein_seams` permiten ensayar mapas de coordenadas y comprobar relaciones de costura antes de trasladarlas a otros sistemas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor declara una validación parcial como matemática y como arquitectura de registro ejecutable, con reproducción del ejemplo de la página 23 y de las rutinas de Fourier, Hadamard y reconstrucción, pero sin métricas comparativas frente a otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplica; el modelo no usa GPU ni pesos en memoria.
- GPU recomendadas: ninguna; el modelo numérico utiliza únicamente la biblioteca estándar de Python.
- Cabe en cualquier equipo con Python 3.10 o superior, incluidos portátiles de gama baja.
- Opciones de despliegue: instalación como paquete Python editable (`python -m pip install -e .`), ejecución de `examples/run_demo.py` y batería de pruebas con `python -m unittest discover -s tests -v`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las rutinas de Fourier son O(N²) por diseño, lo que limita su uso a tamaños de muestra pequeños.

## Comparativa con modelos similares
No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (formalismo simbólico ejecutable con licencia propietaria y sin pesos aprendidos). Las alternativas habituales de la misma tarea serían implementaciones propias del formalismo o librerías de geometría computacional, pero no se dispone de datos para establecer una comparación rigurosa.

## Limitaciones y advertencias
- La licencia es propietaria y no concede ningún derecho: la publicación, el acceso público, la descarga o la posesión no otorgan permiso para usar, copiar, modificar, distribuir, sublicenciar, comercializar, entrenar modelos ni crear datasets con los materiales originales del autor.
- No es un modelo de lenguaje: no genera texto, no razona, no escribe código, no responde preguntas y no admite tool calling ni flujos de agentes.
- No existen pesos, dataset ni entrenamiento; cualquier expectativa de rendimiento tipo benchmark es inaplicable.
- La validación es explícitamente parcial, según el propio autor; no debe interpretarse como una validación física o matemática completa del formalismo.
- Las etiquetas de distancia de muestreadores personalizados son contratos declarados, no garantías; los productos y las transformaciones generales de coordenadas devuelven campos de forma con signo porque ninguna de las dos operaciones preserva la distancia de forma universal.
- La composición de cáscaras es operativa; su realización física depende de la interpretación material y la evidencia suministradas.
- El código Python arbitrario de los muestreadores no se serializa en `config.json`, lo que limita la portabilidad de configuraciones personalizadas.
- Las rutinas de Fourier son O(N²) y no sustituyen a una FFT de alto rendimiento.
- El repositorio tiene un tamaño de 0,0 GB y 27 descargas en el momento de la consulta, con cero likes, lo que refleja una adopción muy limitada.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual, al no ser un modelo generativo; el riesgo principal es interpretar el formalismo como validado más allá de lo que el autor declara.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/c0mbatduckzz/TOM-MAKTUBIII
- Aviso de propiedad y reserva de derechos: `PROPRIETARY_NOTICE.txt` (incluido en el repositorio)
- Informe de validación: `docs/VALIDATION.md` (incluido en el repositorio)
- Mapa ecuación-código: `docs/equation-map.json` (incluido en el repositorio)
- Evaluación reproducible: `evaluation/results.json` (incluido en el repositorio)
- Ejemplo de cáscaras: `examples/shell_demo.py` (incluido en el repositorio)
- Demo de ejecución: `examples/run_demo.py` (incluido en el repositorio)
- Repositorio de clonación: https://huggingface.co/c0mbatduckzz/TOM-MAKTUBIII
