# constructelligence/data-centre-nameplates

## Resumen

Data Centre Nameplates es un pipeline de OCR especializado en la lectura de placas de características (nameplates) de equipos de infraestructura crítica de centros de datos, desarrollado por constructelligence. No es un modelo de lenguaje: se trata de una librería de extracción de información construida sobre Tesseract.js 5 (modelo LSTM de inglés preentrenado, sin ajuste fino) más un analizador determinista de campos etiquetados y un comparador contra un equipment schedule. Su función es responder a una pregunta concreta que el OCR genérico no resuelve: si la unidad fotografiada coincide con la que especifica el pliego de equipos.

El sistema extrae 13 campos (fabricante, modelo, número de serie, tensión, fase, Hz, kVA, kW, amperios, MCA, MOCP, refrigerante y fecha de fabricación) a partir de la imagen de la placa, reconoce 13 familias de equipos (UPS, generador, ATS/STS, switchgear, transformador, PDU/RPP, panelboard, busway, batería, CDU, chiller, CRAH/CRAC y bomba) y emite un veredicto de coincidencia o discrepancia campo a campo, además de generar un registro de activos exportable a CSV.

Es relevante porque todo el procesamiento ocurre en el dispositivo (navegador, Node o edge), sin GPU, sin servidor y sin egreso de datos: una fotografía de infraestructura en producción nunca sale del terminal que la tomó. Está publicado bajo licencia Apache-2.0, soporta únicamente inglés y no declara parámetros, contexto ni cuantizaciones por no ser un modelo neuronal de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de OCR + extraccion determinista: Tesseract.js 5 (LSTM de ingles preentrenado) seguido de analizador de campos etiquetados y comparador de schedule |
| Parametros totales | no disponible (el autor no publica recuento de parametros del modelo LSTM de Tesseract) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de imagen, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (el pipeline usa el modelo preentrenado de Tesseract.js sin cuantizacion declarada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (libreria custom sobre tesseract.js@5; el autor no especifica formato de pesos) |

## Arquitectura y entrenamiento

El sistema no es un transformer ni un modelo de lenguaje, sino una cadena de procesamiento determinista. La primera etapa es OCR mediante `tesseract.js@5` con el modelo LSTM de inglés preentrenado; no se ha realizado ajuste fino. El OCR devuelve líneas de texto con una puntuación de confianza por línea. A continuación, un analizador de campos etiquetados recorre esas líneas buscando marcadores conocidos (`MODEL`, `S/N`, `MVA`, `MCA`, `MOCP`, `FLA`, `VOLTS`, `REFRIGERANT`, `MFG DATE`) y normaliza los valores: las tensiones se interpretan como `480Y/277`, `13.8 kV` o `208/120`, y se descartan falsos positivos (por ejemplo, `480/277` sin palabra de tensión no se considera una tensión, ni `R-513A` o un peso de carga se interpretan como amperios). Las líneas con confianza cercana a cero, típicas de metal cepillado o texturas de fondo, se eliminan antes del análisis.

Sobre esa extracción actúan dos componentes adicionales. Un clasificador de tipo de equipo identifica la familia a partir del vocabulario de la placa (UPS, generador, ATS, switchgear, transformador, PDU/RPP, panelboard, busway, batería, CDU, chiller, CRAH/CRAC, bomba). Por último, el comparador de schedule ordena las etiquetas candidatas: una coincidencia de número de serie prevalece; en su defecto domina la similitud de modelo, con fabricante y tipo de equipo como desempate. Las comparaciones de códigos pliegan caracteres confundibles por OCR (`O/0`, `I/L/1`, `S/5`, `B/8`, `Z/2`) e ignoran la puntuación, de modo que un error de lectura no genera un falso desajuste, mientras que una variante real de tensión (`NPX-750-415` frente a `NPX-750-480`) sí falla. El resultado es un veredicto por campo (`ok`, `mismatch`, `unread`) y un estado global (`verified`, `partial`, `mismatch`, `unmatched`, `missing`). No hay RLHF ni DPO, ya que no existe componente generativo entrenable.

## Capacidades

- Extraccion OCR de 13 campos de placa: fabricante, modelo, serial, tension, fase, Hz, kVA, kW, amperios, MCA, MOCP, refrigerante y fecha de fabricacion.
- Conversion de texto de placa en campos estructurados, no en parrafos libres (por ejemplo, `INPUT: 480Y/277 VAC 3 PH 60 HZ` se descompone en `voltage`, `phase` y `hz`).
- Tolerancia a errores tipicos de OCR en rotulacion de placas: reparacion de `V`/`Vv`, `K`/`X` (`XVA`), `HZ`/`Hw` y codigos partidos tras su puntuacion (`NPX- 750- 480`).
- Reconocimiento automatico de 13 familias de equipos a partir del texto de la placa.
- Verificacion contra equipment schedule con ranking de candidatos por serial, modelo, fabricante y tipo.
- Plegado de caracteres confundibles (`O/0`, `I/L/1`, `S/5`, `B/8`, `Z/2`) en la comparacion de codigos, con deteccion de variantes reales de tension.
- Generacion de un registro de activos exportable a CSV.
- Ejecucion integra en el dispositivo (navegador, Node o edge), sin GPU, sin servidor y sin egreso de datos.
- No dispone de tool calling, function calling, modo agente ni razonamiento multi-paso, por no ser un modelo generativo.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Puesta en marcha (commissioning) de un CPD: el tecnico fotografía la placa de cada UPS, PDU o switchgear y el sistema devuelve un veredicto de coincidencia contra el pliego, senalando la tension o el modelo que no cuadra antes de energizar el equipo.
- Control de calidad de entregas en obra: se verifica que la unidad recibida corresponde a la especificada (`NPX-750-480`) y no a una variante de tension distinta, evitando el coste de devolucion e instalacion de un equipo incorrecto.
- Construccion de un registro de activos (asset register): las lecturas se exportan a CSV y alimentan inventarios o sistemas CMMS, cubriendo el caso frecuente de equipos que nunca llegan a registrarse.
- Auditoria de sala de datos en operacion: al ejecutarse en el navegador del propio telefono, las fotografias de infraestructura en produccion no se suben a ningun servicio externo, lo que facilita cumplir politicas de privacidad y seguridad.
- Verificacion de completitud del schedule: el estado `missing` (planificado pero no escaneado) permite detectar que falta un equipo por fotografiar o por instalar en una sala concreta.
- Inspeccion con conectividad limitada: al no requerir servidor ni GPU, el pipeline funciona en campo, en plantas con red restringida o en modo offline, sobre Node o directamente en el navegador.
- Integracion en flujos de QA automatizados (AEC): el parser determinista puede invocarse desde scripts de Node para procesar lotes de fotografias y generar informes de conformidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el pipeline no requiere GPU.
- GPU recomendadas: ninguna; la inferencia de Tesseract.js se ejecuta en CPU.
- Compatibilidad con GPU de consumo: no aplica, funciona sin GPU en cualquier equipo de consumo.
- Opciones de despliegue: navegador, Node.js y entornos edge; distribuido como libreria custom sobre tesseract.js@5. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo / herramienta | Tipo | Campos estructurados de placa | Verificacion contra schedule | Idiomas | Licencia | Ejecucion local |
|---|---|---|---|---|---|---|
| Data Centre Nameplates | OCR + parser determinista | Si (13 campos, 13 tipos de equipo) | Si | en | apache-2.0 | Si (navegador/Node/edge, sin GPU) |
| Tesseract.js (OCR directo) | OCR generico | No | No | Multiples | Apache-2.0 | Si (navegador/Node) |
| PaddleOCR | OCR generico + deteccion de layout | No (no especifico de placas) | No | Multiples | Apache-2.0 | Si |
| Servicios cloud de Document AI (por ejemplo, Azure o AWS) | OCR gestionado con extraccion | Extraccion configurable | No especifico de equipos de CPD | Multiples | Propietaria (servicio de pago) | No (requiere nube) |

No se dispone de datos de rendimiento comparativo publicados por el autor para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El sistema esta limitado al idioma ingles; no soporta placas en otros idiomas.
- La precision depende de Tesseract.js sobre metal cepillado o fondos texturizados; aunque se descartan lineas de baja confianza, el OCR puede fallar en fotografias con poca luz, angulo oblicuo o reflejos.
- Las marcas y modelos no incluidos en las ~44 marcas reconocidas como palabras completas pueden clasificarse como "la linea que parece una empresa", con riesgo de asignacion incorrecta de fabricante.
- El veredicto puede arrojar `unread` o `partial` cuando el OCR no captura un campo; no equivale a una verificacion completa.
- El ajuste tolerante de codigos (`O/0`, `I/L/1`, etc.) reduce falsos desajustes, pero en teoria podria enmascarar diferencias reales si dos codigos validos solo difieren en esos caracteres.
- Al ser un analizador determinista y no un modelo generativo, no presenta alucinacion de texto libre, pero tampoco maneja formatos de placa muy alejados de las convenciones asumidas.
- No declara datos de benchmarks ni de latencia, por lo que su idoneidad en produccion a gran escala debe validarse con pruebas propias.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar la licencia del modelo LSTM de Tesseract.js subyacente en la distribucion final.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/constructelligence/data-centre-nameplates
- Demo en Spaces: https://huggingface.co/spaces/constructelligence/data-centre-nameplates
- Tesseract.js: https://github.com/naptha/tesseract.js
