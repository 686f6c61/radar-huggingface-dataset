# ctcheung/what-does-the-flock-say

## Resumen

"What Does the Flock Say? — concentric troupe" es un artefacto de politica de control para robots de la familia MicroDuck, publicado por el usuario ctcheung en HuggingFace. No es un modelo de lenguaje: es un paquete de inferencia que contiene una politica neuronal exportada a ONNX (60 entradas float32, 14 salidas float32 a 50 Hz) junto con una linea de tiempo coreografiada de 20 segundos para ocho unidades MicroDuck en un entorno fisico compartido de Arena. El repositorio incluye la politica propia seleccionada (checkpoint N28000) y referencias fijadas a una politica donante de terceros para cinco de los ocho patos.

El proposito del artefacto es artistico y demostrativo: sincronizar una pequena formacion de robots cuadrupedos (tres en un arco interior de radio 0,5 m y cinco en un arco trasero de 1,3 m) ejecutando una secuencia de sentarse, levantarse, sacudir la cabeza y girar, acompanada de 539 eventos de nota sintetizados que evocan la melodia de referencia. La relevancia es limitada fuera de ese contexto: sirve como ejemplo reproducible de composicion de politicas en el ecosistema MicroDuck y de publicacion con trazabilidad criptografica (hashes SHA256 de checkpoint, politica y linea de tiempo).

El autor es explicito en que no se trata de un modelo entrenado de nuevo ni de una validacion de hardware: la exportacion ONNX es una derivada con correccion de metadatos de un export previo, y la ejecucion registrada corresponde a una unica semilla en simulacion local (Arena 0.7.0 / runner5, seed1). No hay licencia declarada ni idiomas soportados, y el tamano del repositorio es practicamente nulo (0,0 GB), lo que confirma que no redistribuye pesos del donante ni activos de malla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control neuronal exportada a ONNX (grafo no documentado en la model card); no es un transformer ni un LLM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de control de 20 s a 50 Hz (1000 pasos) |
| Tipos de cuantizacion | no disponible; pesos en formato ONNX (precision original no declarada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el autor declara permiso de publicacion del propietario, sin licencia nombrada ni MIT/Apache/CC) |
| Formato de pesos | ONNX (entrada float32 [1,61], salida float32 [1,14]) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red. Lo que si documenta es la interfaz fisica: la entrada es un vector float32 de 61 dimensiones y la salida un vector float32 de 14 dimensiones, evaluados a 50 Hz. El manifiesto preserva la semantica de entrenamiento "physical13": el comando twist se compone de bandera de sentado, velocidad lateral en el marco del cuerpo (m/s) y velocidad angular Z en el marco del cuerpo (rad/s); la cabeza son cuatro offsets en radianes relativos al valor por defecto; el cuerpo son seis offsets de pose relativos a STAND en metros y radianes, con convencion Rz(yaw) Ry(pitch) Rx(roll). No se sustituye la factoria por defecto de sentado/cabeza.

El checkpoint propio seleccionado es N28000 (SHA256 `2864fc8bb597ebb726c6ba46cacf351b6b9cdb28b8ba450b46de5b316236e7b4`), y la politica incluida tiene SHA256 `fa023caa7237cbbfb9cb9e2a057b418184cee97e59024ff19be684885db4294f`. Los patos 1, 7 y 8 usan esa politica propia; los patos 2 a 6 toman prestada la politica "dizzy-duck" de q2p en la revision inmutable `110ee9ee085dd673aa7617d4f7d029769f341df0` (SHA256 `dcaf0208ef83806deceb42d142c6ea9f29ac4a8f0466c68fc7d33241c10c371e`), cuyo origen de entrenamiento declarado es el repositorio pollen-robotics/microduck-challenges en el commit `382da2102`. No hay datos sobre numero de tokens, composicion del dataset ni etapas de RLHF o DPO, porque no es un modelo de lenguaje.

La innovacion tecnica destacable no esta en el aprendizaje sino en la trazabilidad: la exportacion ONNX es una derivada con correccion de metadatos (eliminacion de claves duplicadas y portabilidad de una ruta de procedencia) sin cambios en grafo, pesos ni normalizacion embebida; existe una prueba historica de 64 sondas de entrada cruda con identidad byte a byte frente al export original, y el ensamblado final del ZIP reutiliza esa prueba ligada por hash sin ejecutar nueva inferencia.

## Capacidades

- Generacion de comandos de control a 50 Hz para robots MicroDuck: salida de 14 valores float32 que codifican twist, cabeza y pose corporal.
- Ejecucion de una coreografia de 20 segundos con ocho unidades: sentarse, levantarse (los traseros se incorporan primero el central y luego por parejas), sacudir la cabeza entre los segundos 5 y 7, y girar entre los segundos 7 y 20.
- Reproduccion de una linea de tiempo musical sintetizada con 539 eventos de nota y ocho voces seleccionadas, sin usar la grabacion original.
- Movimiento de boca por tarareo nativo ("mm") de aproximadamente 1,75 grados en su maximo nativo, con retardo de 20 ms en la envolvente de sonido y suavizado nativo.
- Composicion de politicas heterogeneas: mezcla de una politica propia y una donante fijada por revision dentro de la misma escena.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingues, vision ni audio de entrada; no es un modelo de lenguaje ni un modelo multimodal.

## Casos de uso

- Demostracion de formaciones roboticas sincronizadas: el paquete permite reproducir una escena de ocho MicroDuck con fisica compartida en Arena 0.7.0 / runner5, util para exhibiciones y divulgacion de robotica de enjambre a pequena escala.
- Reproducibilidad de experimentos de control: los hashes SHA256 de checkpoint, politica y linea de tiempo permiten verificar que una ejecucion corresponde exactamente al artefacto publicado, lo que sirve como plantilla de publicacion auditable en investigacion.
- Composicion de politicas de terceros: el patron de referenciar una politica donante por revision inmutable (q2p/microduck-dizzy-duck@110ee9ee) sin redistribuir pesos es un ejemplo practico de reutilizacion con atribucion en el ecosistema MicroDuck.
- Evaluacion de interfaces de control fisico: la definicion explicita de twist, offsets de cabeza y offsets de pose relativa a STAND con convencion Rz/Ry/Rx sirve para probar pipelines de conversion entre comandos abstractos y senales de actuadores.
- Arte generativo con robots: la secuencia de 20 s con eventos de nota sintetizados y movimiento de boca por tarareo puede integrarse en instalaciones artisticas o performances musicales robotizadas.
- Pruebas de validacion de exportaciones ONNX: la metodologia de sondas de entrada cruda y validacion estricta del grafo es reutilizable para verificar que una reexportacion no altera el comportamiento numerico.
- Docencia sobre trazabilidad y derechos: el documento detalla con precision que derechos se afirman y cuales no (permiso del propietario frente a licencia de modelo, derechos musicales de la composicion de referencia), lo que lo convierte en material de discusion sobre publicacion de artefactos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de ejecucion registrada es cualitativa y de una sola semilla: replay nativo de 20 s sin etiquetas de caida para los ocho patos; los patos frontales 1, 7 y 8 permanecen de pie los 20 s; los traseros completan la incorporacion en 1,84 s (duck4), 2,84/2,82 s (ducks3/5) y 3,82/3,84 s (ducks2/6). El autor advierte que una sola semilla no constituye prueba de robustez, contacto sin deslizamiento ni certificacion de hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es un grafo ONNX pequeno (entrada 61, salida 14) y el repositorio ocupa 0,0 GB, por lo que la huella de pesos es minima.
- GPU recomendadas: no disponible; el autor menciona una unica sonda de admision en CPU durante la validacion, lo que sugiere que la inferencia puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: previsiblemente cualquier GPU de consumo puede alojar el grafo por su tamano, aunque no hay datos publicados de latencia ni throughput.
- Opciones de despliegue: ONNX Runtime es el runtime implicito del formato; el ecosistema de referencia es Arena 0.7.0 / runner5 de Pollen Robotics. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: el control opera a 50 Hz (periodo de 20 ms), pero no se publican mediciones de tiempo de inferencia por paso.
- Requisito adicional: la ejecucion completa requiere el simulador Arena con fisica compartida y ocho instancias de robot; no se autoriza el uso en hardware real.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ctcheung/what-does-the-flock-say | Politica de control ONNX + coreografia | no disponible | 20 s a 50 Hz | no disponible | HuggingFace, repo de 0,0 GB |
| q2p/microduck-dizzy-duck (revision 110ee9ee) | Politica de control donante | no disponible | no disponible | no declarada en la model card citada | HuggingFace, referenciada por revision inmutable |
| pollen-robotics/microduck-challenges (commit 382da2102) | Codigo y entorno de entrenamiento | no aplica | no aplica | no disponible en la informacion | GitHub |

No se dispone de datos de rendimiento comparables entre estas entradas, por lo que la comparativa se limita a formato, procedencia y condiciones de uso.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal: no genera texto, no razona, no soporta tool calling ni agentes; cualquier uso en esos terminos es un error de categoria.
- La validacion se limita a una unica semilla en simulacion local; el autor declara explicitamente que no constituye prueba de robustez, de contacto sin deslizamiento, de seguimiento corporal completo ni de certificacion de hardware.
- No se autoriza el uso en hardware real; el artefacto esta pensado para el simulador Arena.
- La licencia no esta declarada: el permiso del propietario para publicar y entrar en Arena no equivale a una licencia de modelo, y el autor no afirma derechos para redistribuir pesos fuera de la plataforma ni para los derechos musicales de la composicion de referencia.
- Riesgo de derechos de terceros: la melodia se inspira en "The Fox (What Does the Fox Say?)" de Ylvis y el autor advierte que la sintesis de notas no resuelve derechos de composicion, adaptacion, arreglo ni publicacion.
- La atribucion de contactos fisicos no fue instrumentada, por lo que no puede verificarse el comportamiento de contacto entre robots.
- El movimiento de boca por tarareo es de aproximadamente 1,75 grados en su maximo nativo y esta sujeto a retardo de 20 ms y suavizado; el autor prohibe ocultar estas limitaciones mediante exageracion de la mandibula.
- La entrada de sentado no fuerza un primer fotograma sentado: Arena arranca desde STAND con un asentamiento de 0,5 s, y los patos traseros descienden durante unos 0,28-0,36 s del espectaculo cronometrado.
- No hay datos publicados de sesgos, alucinacion ni limitaciones de idioma porque el artefacto no procesa lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ctcheung/what-does-the-flock-say
- Politica donante q2p/microduck-dizzy-duck (revision fijada): https://huggingface.co/q2p/microduck-dizzy-duck/tree/110ee9ee085dd673aa7617d4f7d029769f341df0
- Fuente de entrenamiento declarada por el donante: https://github.com/pollen-robotics/microduck-challenges/tree/382da2102
- Contexto adicional del mismo repositorio (fork): https://github.com/llama/microduck-challenges
- Terminos de servicio de Hugging Face (seccion "Your Content"): https://huggingface.co/terms-of-service
