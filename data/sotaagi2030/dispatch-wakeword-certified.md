# SOTAagi2030/Dispatch-Wakeword-Certified

## Resumen

Dispatch Wakeword Certified es un modelo de deteccion de palabra de activacion (keyword spotting) publicado por el usuario SOTAagi2030 en Hugging Face, empaquetado en formato TFLite y orientado especificamente al entorno de consolas de despacho de emergencias. El modelo reconoce una frase de activacion "aprobada" y esta disenado para ejecutarse de forma totalmente offline, sin transmitir el audio de la consola a ningun servicio externo. Su salida se limita a tres etiquetas: `background`, `dispatch` y `unknown`.

A diferencia de los modelos de lenguaje o de vision, se trata de un clasificador de audio de ventana corta: la model card declara entrada mono PCM a 16 kHz con ventanas de 1,0 segundo. El repositorio no publica arquitectura, numero de parametros, datos de entrenamiento ni metricas de rendimiento. El propio autor establece una frontera de seguridad explicita: el modelo nunca debe iniciar una llamada, un aviso (page) ni un registro de incidente sin confirmacion explicita del operador humano.

La relevancia del modelo es acotada y practica: los sistemas de despacho de emergencias operan en entornos con requisitos de latencia baja, soberania del dato y trazabilidad normativa, donde un activador por voz que funcione sin conexion puede reducir la carga manual del operador. Sin embargo, el repositorio presenta senales de escasa madurez: 0 descargas, 0 likes, un tamano de 0,0 GB y una ficha creada y actualizada con diez segundos de diferencia. Cualquier evaluacion en produccion deberia empezar por verificar la existencia real de pesos y de la evidencia de certificacion citada en la carpeta `compliance/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo indica la etiqueta TFLite y el pipeline audio-classification) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; ventana de audio de 1,0 segundo, mono PCM a 16 kHz |
| Tipos de cuantizacion | no disponible (formato TFLite; el autor no especifica float32, float16 ni int8) |
| Idiomas soportados | no disponible (la frase de activacion "aprobada" no se documenta) |
| Licencia | apache-2.0 |
| Formato de pesos | TFLite (segun la etiqueta del repositorio); el repositorio figura con 0,0 GB, por lo que no se pueden confirmar pesos descargables |

Otros datos declarados por el autor:

| Parametro | Valor |
|---|---|
| Tarea | audio-classification / keyword-spotting |
| Etiquetas de salida | `background`, `dispatch`, `unknown` |
| Formato de entrada | mono PCM, 16 kHz |
| Region declarada | us |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-14 |
| Fecha de actualizacion | 2026-09-14 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. La model card no describe si se trata de una red convolucional (CNN), de un modelo recurrente, de una arquitectura tipo CRNN, de un transformer de audio reducido ni de una red de tipo DS-CNN, que es el patron habitual en clasificacion de palabras clave sobre TFLite. Tampoco se detalla el numero de capas, la dimension del embedding acustico, el tipo de caracteristicas de entrada (MFCC, log-mel, espectrograma en bruto) ni el mecanismo de pooling temporal.

Respecto al entrenamiento, la informacion disponible es igualmente nula: no se especifica el numero de horas de audio, la composicion del dataset, si se uso el corpus Google Speech Commands o datos propios de consolas de despacho, ni si hubo aumento de datos con ruido de sala de control, voces solapadas o canales de radio. Tampoco se documenta ninguna fase de ajuste fino con retroalimentacion humana ni umbral de decision calibrado. La unica innovacion tecnica declarada es de caracter operativo, no algorítmico: ejecucion completamente offline, sin transmision del audio de la consola, y una frontera de seguridad que obliga a confirmacion humana antes de cualquier accion de despacho. La model card menciona ademas evidencia de certificacion incluida bajo `compliance/`, sin que se describa su contenido ni el organismo certificador.

## Capacidades

- Clasificacion de audio en tres clases: `background`, `dispatch` y `unknown`, sobre ventanas de 1,0 segundo.
- Deteccion de una frase de activacion aprobada por la organizacion, segun la propia descripcion del autor.
- Ejecucion totalmente offline: no requiere conexion de red ni transmite audio de la consola.
- Procesamiento de audio mono PCM a 16 kHz, lo que encaja con captura de microfono de banda estrecha y con audio telefónico remuestreado.
- Empaquetado en formato TFLite, pensado para inferencia en dispositivos de borde o en CPU sin acelerador dedicado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo de razonamiento explicito; son capacidades no aplicables a un clasificador de palabras clave.

## Casos de uso

- Activacion manos libres en consola de despacho: el operador mantiene las manos ocupadas en el teclado o en un panel de radio y pronuncia la frase de activacion para abrir el flujo de registro de incidente, con la ventana de 1,0 segundo como unidad minima de decision.
- Reduccion de falsos positivos frente a un boton fisico: al clasificar explicitamente la clase `background` y `unknown`, el modelo puede actuar como filtro previo antes de que el sistema abra un formulario de incidente, siempre con confirmacion humana posterior.
- Despliegue en centros con requisito de aislamiento de red (air-gapped): al no transmitir audio, encaja en instalaciones de emergencias que prohiben enviar voz a servicios cloud por motivos de privacidad y de cadena de custodia.
- Integracion en sistemas CAD (computer-aided dispatch): el modelo puede emitir una senal de activacion que el software de despacho interprete como "preparar registro", quedando la apertura efectiva del incidente condicionada a la accion del operador, tal como exige la frontera de seguridad declarada.
- Accesibilidad para operadores con movilidad reducida: la activacion por voz sustituye combinaciones de teclas o botones fisicos dificiles de alcanzar en un puesto con multiples pantallas.
- Auditoria y cumplimiento normativo: la carpeta `compliance/` declarada en la model card serviria como soporte documental en revisiones internas, siempre que su contenido se pueda verificar de forma independiente.
- Investigacion sobre robustez de KWS en entornos ruidosos: el modelo puede usarse como linea base para medir tasas de falsa aceptacion y falso rechazo en audio de sala de control con voces solapadas, radios y alarmas.
- Prototipado rapido de asistentes de dictado posteriores a la activacion: una vez disparada la etiqueta `dispatch`, se puede encadenar un motor de reconocimiento de voz completo para redactar el parte de incidente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de falsa aceptacion (FAR), falso rechazo (FRR), precision, recall, F1, curvas DET ni comparaciones frente a otros detectores de palabra clave. Tampoco se documentan mediciones de latencia, consumo energetico ni rendimiento en condiciones de ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un artefacto TFLite de clasificacion de audio, el escenario previsto es inferencia en CPU o en aceleradores de borde, no en GPU de datacenter.
- GPU recomendadas: no disponibles ni necesarias para el formato declarado. El modelo esta pensado para ejecutarse en el runtime TFLite, con posible delegacion a NNAPI en Android, a GPU movil o a Coral Edge TPU si el artefacto estuviera cuantizado a int8, extremo que el autor no confirma.
- Compatibilidad con GPU de consumo: no aplica. El objetivo declarado del formato es hardware embebido y CPU de proposito general.
- Opciones de despliegue: interprete TensorFlow Lite / LiteRT; conversion a ONNX Runtime si se necesita portar a otros backends; integracion mediante el SDK de TFLite en aplicaciones de escritorio o moviles; posible uso con aceleradores Edge TPU previa cuantizacion completa a enteros.
- Latencia y throughput estimados: no disponibles. Como restriccion derivada, la ventana de decision de 1,0 segundo implica que el sistema necesita acumular al menos ese buffer de audio antes de emitir una etiqueta fiable.
- Requisitos de almacenamiento: el repositorio figura con 0,0 GB, por lo que no se puede estimar el peso real del artefacto ni confirmar que los pesos esten publicados.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Idiomas / activacion | Parametros | Metricas publicadas | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Dispatch Wakeword-Certified | Keyword spotting para despacho de emergencias | TFLite | apache-2.0 | no disponible; frase de activacion no documentada | no disponible | no | Repositorio sin descargas ni pesos verificables (0,0 GB) |
| openWakeWord | Deteccion de palabra de activacion de proposito general | ONNX / TFLite | Apache-2.0 (modelos y codigo) | Ingles; multiples frases preentrenadas y posibilidad de entrenar las propias | no disponible en esta ficha | El proyecto publica evaluaciones en su repositorio | Ampliamente adoptado en el ecosistema domotico y de asistentes |
| Picovoice Porcupine | Wake word comercial | SDK propietario, modelos compactos | Propietaria, con licencia gratuita limitada | Multiples idiomas y frases personalizadas | no disponible | Documentacion comercial con metricas internas | SDK mantenido con soporte empresarial |
| Google Speech Commands KWS (referencias academicas) | Clasificacion de palabras clave | TensorFlow / TFLite | Apache-2.0 en los ejemplos publicados | Ingles, vocabulario cerrado de comandos | no disponible | Amplia literatura con precision por clase | Usado como linea base academica, no como producto |

La comparacion cuantitativa no es posible: el modelo de SOTAagi2030 no publica parametros, contexto de entrenamiento ni resultados, mientras que los modelos alternativos cuentan con repositorios mantenidos, documentacion de rendimiento y comunidades activas que permiten validarlos.

## Limitaciones y advertencias

- Repositorio sin evidencia verificable: 0 descargas, 0 likes, tamano de 0,0 GB y fechas de creacion y actualizacion separadas por diez segundos. No se puede confirmar que los pesos esten realmente publicados ni que el modelo haya sido entrenado.
- Ausencia total de documentacion de entrenamiento: sin dataset, sin horas de audio, sin condiciones de captura y sin particion de validacion, es imposible estimar sesgos por acento, sexo, edad, idioma o calidad de microfono.
- Riesgo de falsos positivos en produccion: en un entorno de despacho, una activacion espuria puede interferir en la operacion. No hay curvas FAR/FRR publicadas que permitan fijar un umbral de decision justificado.
- Riesgo de alucinacion en el sentido de clasificacion erronea con alta confianza: la model card no documenta calibracion ni umbrales, por lo que una etiqueta `dispatch` no debe interpretarse como certeza.
- Frontera de seguridad declarada por el autor: el modelo no debe iniciar llamadas, avisos ni registros de incidente sin confirmacion explicita del operador. Automatizar esa accion iria contra las propias condiciones de uso indicadas.
- Frase de activacion no especificada: al no documentarse la frase aprobada ni el vocabulario, no se puede evaluar la colision fonetica con el habla habitual de una sala de control.
- Ambito geografico y regulatorio restringido: la etiqueta `region: us` y la referencia a "regional emergency dispatch consoles" apuntan a un contexto normativo estadounidense; su adecuacion al marco europeo (112, RGPD, normativa de registro de llamadas) no esta evaluada.
- Idiomas no declarados: la ficha no indica si el detector funciona fuera del ingles, lo que limita su uso en centrales de habla hispana.
- Certificacion no acreditada: la model card cita evidencia en `compliance/` y el nombre incluye "Certified", pero no se identifica organismo certificador, version del artefacto ni alcance de la certificacion.
- Licencia permisiva con matices operativos: apache-2.0 permite uso comercial y modificacion, pero no exime de responsabilidad sobre el uso en sistemas criticos ni sustituye las certificaciones exigidas en el dominio de emergencias.
- Trazabilidad del autor: se trata de un unico publicador sin historial, repositorio de soporte ni canal de incidencias conocidos, lo que dificulta el mantenimiento a largo plazo en produccion.
- Resultados de busqueda no concluyentes: las consultas web realizadas no devolvieron papers, blogs ni repositorios relacionados con este modelo, por lo que no existe validacion externa disponible.

## Enlaces

- Hugging Face: https://huggingface.co/SOTAagi2030/Dispatch-Wakeword-Certified
- Paper: no disponible
- Blog o anuncio del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Evidencia de certificacion: referenciada por el autor como carpeta `compliance/` dentro del repositorio, sin enlace publico verificable
- Referencias externas relacionadas con el modelo: no se encontraron resultados utiles en la busqueda web
