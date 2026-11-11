# MihhailTLN/owlown-gigachat3.1

## Resumen

OwlOwn GigaChat 3.1 es un reempaquetado en formato MLX de 4 bits del modelo ai-sage/GigaChat3.1-10B-A1.8B, un transformer de tipo Mixture of Experts (MoE) con 10.000 millones de parametros totales y 1.800 millones activos por token. Lo publica el usuario MihhailTLN como artefacto de distribucion para OwlOwn, una aplicacion de iPhone que ejecuta el modelo de forma totalmente local y sin conexion a internet. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son una cuantizacion del modelo base y la model card lo declara explicitamente.

Su relevancia es practica: demuestra un patron de despliegue de un MoE de 10B en un telefono. La estructura del repositorio separa los tensores de los expertos enrutados (`pack/`) del resto (`nonexpert.safetensors`), de modo que la app puede leer los expertos directamente desde el almacenamiento flash del dispositivo en lugar de cargarlos completos en memoria. Esa particion es la que hace viable un modelo de este tamano en hardware movil.

El modelo base, GigaChat 3.1, procede de ai-sage (Sber) y esta orientado a conversacion y generacion de texto en ruso e ingles. El repositorio tiene 6,1 GB, licencia MIT y cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), tag `deepseek_v3` en el repo; transformer con expertos enrutados |
| Parametros totales | 10B (segun nombre del modelo base) |
| Parametros activos | 1.8B (segun nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX, group size 64 |
| Idiomas soportados | Ruso e ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); `nonexpert.safetensors` + `pack/` con expertos enrutados; `reference.json` con prompts y tokens de referencia |
| Tamano del repositorio | 6,1 GB |
| Libreria | MLX |
| Modelo base | ai-sage/GigaChat3.1-10B-A1.8B |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base ai-sage/GigaChat3.1-10B-A1.8B: un transformer con capas de mezcla de expertos en las que, de los 10.000 millones de parametros totales, solo 1.800 millones se activan por token. El tag `deepseek_v3` del repositorio sugiere un diseno de enrutamiento de expertos inspirado en esa familia. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card del modelo base, que no se ha proporcionado.

La innovacion de este repositorio es de despliegue, no de entrenamiento. La cuantizacion a 4 bits con group size 64 se aplica con MLX y los pesos se almacenan sin modificar. La separacion entre `nonexpert.safetensors` (todos los tensores salvo los expertos enrutados) y `pack/` (los expertos enrutados, byte a byte, con una disposicion pensada para lecturas directas desde el flash del telefono) permite cargar solo los expertos necesarios por token y evitar tener el modelo completo residente en RAM. El fichero `reference.json` contiene prompts fijos con tokens de salida de referencia para el autotest de la aplicacion.

## Capacidades

- Generacion de texto y conversacion multi-turno en ruso e ingles.
- Razonamiento y respuesta a instrucciones heredados del modelo base GigaChat 3.1.
- Inferencia totalmente local en el dispositivo, sin conexion a internet.
- Carga bajo demanda de expertos enrutados desde almacenamiento flash, lo que reduce la memoria residente.
- Autoverificacion de integridad mediante `reference.json` (prompts y tokens de salida esperados).
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente conversacional offline en iPhone: la app descarga el repositorio en el primer arranque y ejecuta el modelo en local, de modo que las conversaciones no salen del dispositivo. Adecuado para escenarios de privacidad estricta o conectividad intermitente.
- Autotest de integracion en la app: `reference.json` permite comparar los tokens generados con los de referencia y detectar corrupciones de pesos o fallos de cuantizacion tras la descarga.
- Distribucion de modelos en aplicaciones moviles: el patron de separar expertos en `pack/` y leerlos desde flash sirve como referencia para empaquetar otros MoE en apps iOS con MLX.
- Procesamiento de texto en ruso en entornos sin red: redaccion, resumen y reescritura de documentos en dispositivos gestionados por empresas con requisitos de confidencialidad.
- Prototipado de funciones de IA generativa en iOS sin backend: el equipo de desarrollo puede integrar el modelo en una build de prueba y validar latencia y calidad antes de decidir si necesita un servicio en la nube.
- Evaluacion de MLX frente a otros runtimes: al ser una cuantizacion 4-bit con group size 64, permite medir throughput y consumo de memoria de un MoE de 10B en hardware Apple frente a alternativas GGUF o vLLM.
- Base para experimentos de investigacion sobre inferencia MoE en dispositivos: la particion de pesos facilita estudiar el impacto del offloading de expertos en latencia y RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: el repositorio ocupa 6,1 GB en disco; la memoria residente depende de cuantos expertos se carguen por token. No se dispone de cifras oficiales de pico de RAM.
- Hardware objetivo: iPhone con MLX; el modelo esta disenado para ejecutarse en el telefono con lectura de expertos desde flash.
- GPU de escritorio: no se documentan requisitos para A100, H100 o RTX 4090. MLX esta orientado a silicio Apple (M1/M2/M3/M4), no a CUDA.
- Cabe en GPU de consumo: no disponible; en Mac con Apple Silicon la viabilidad depende de la RAM unificada, pero no se han publicado mediciones.
- Opciones de despliegue: MLX y la app OwlOwn. No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OwlOwn GigaChat 3.1 (este) | 10B | 1.8B | no disponible | MIT | MLX 4-bit | Reempaquetado para iOS; ruso e ingles |
| ai-sage/GigaChat3.1-10B-A1.8B | 10B | 1.8B | no disponible | MIT | safetensors | Modelo base original; sin cuantizar |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparacion mas directa es con el propio modelo base: este repositorio anade la cuantizacion 4-bit MLX y la particion de expertos para lectura desde flash, pero no cambia la calidad del modelo. Frente a alternativas de otros proveedores no hay datos en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo nuevo: es un reempaquetado del modelo base. Cualquier sesgo o limitacion del original (GigaChat 3.1) se hereda sin cambios.
- Idiomas limitados a ruso e ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo base en tareas sensibles, aunque no se han publicado mediciones de esa perdida.
- La licencia MIT figura en el repositorio, pero la model card remite a los terminos del modelo base; conviene verificar las condiciones del modelo original antes de un uso comercial.
- Dependencia de MLX y de Apple Silicon: no es portable a CUDA ni a otros runtimes sin conversion.
- Repositorio con cero descargas y sin pipeline declarado: no hay evidencia de uso en produccion ni validacion externa.
- El rendimiento real en el telefono depende de la gestion de memoria de la app OwlOwn; no se han publicado latencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MihhailTLN/owlown-gigachat3.1
- Modelo base: https://huggingface.co/ai-sage/GigaChat3.1-10B-A1.8B
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
