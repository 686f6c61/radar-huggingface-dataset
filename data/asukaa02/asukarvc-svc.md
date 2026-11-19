# Asukaa02/AsukaRVC-SVC

## Resumen

AsukaRVC-SVC (también referido como ARVC-SVC) es una aplicación de síntesis de voz cantada de estilo Vocaloid desarrollada por el usuario Asukaa02 y publicada en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional entrenado desde cero, sino de un *pipeline* de conversión de voz que combina un sintetizador de formantes propio con un motor RVC (Retrieval-based Voice Conversion) para transformar el timbre de una interpretación vocal generada a partir de una partitura. El repositorio contiene el código de la aplicación (interfaz web, motor DSP, puente con RVC), no pesos de un modelo entrenado por el autor.

El flujo de trabajo es el siguiente: el usuario dibuja una melodía y letras en un piano roll, el sistema convierte las letras a fonemas mediante el diccionario CMUdict con un *fallback* basado en reglas, un sintetizador de formantes y pulso glotal genera una voz portadora a 16 kHz respetando la curva de tono, el *timing*, el vibrato y las consonantes, y finalmente un *voicebank* RVC (`.pth` más un `.index` FAISS opcional) convierte esa interpretación sustituyendo el timbre. El resultado se masteriza con compresor, reverb y limitador, y se exporta a WAV.

La relevancia de este proyecto es acotada: no compite con modelos TTS o de canto de gran escala, sino que ofrece una herramienta local, ejecutable en CPU, para producir voces cantadas con *voicebanks* RVC existentes. La model card no proporciona información sobre arquitectura de red neuronal propia, parámetros, contexto ni benchmarks, por lo que muchos de los campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline DSP + RVC: sintetizador de formantes y pulso glotal (voz portadora) seguido de conversión de voz RVC v1/v2 |
| Parametros totales | no disponible (el repositorio no incluye pesos de un modelo entrenado por el autor; los *voicebanks* RVC los aporta el usuario) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (RVC opera con pesos PyTorch `.pth`; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible; el G2P usa CMUdict (inglés) con *fallback* basado en reglas, por lo que el soporte real de letras está orientado al inglés |
| Licencia | no disponible |
| Formato de pesos | `.pth` (RVC v1/v2) más `.index` FAISS opcional; el proyecto se guarda en JSON en `data/projects/`; salida en WAV |

## Arquitectura y entrenamiento

El sistema no entrena una red neuronal propia: la model card describe un *pipeline* determinista de cuatro etapas. Primero, un motor G2P convierte las letras en fonemas usando el diccionario CMUdict (descargado en el *setup*) y un *fallback* letra-a-sonido basado en reglas. Segundo, un sintetizador de formantes con pulso glotal genera una interpretación vocal a 16 kHz que respeta exactamente la curva de tono, el *timing*, el vibrato, los *portamentos*, los *scoops*, la respiración y las consonantes definidas en la partitura. Tercero, el motor RVC convierte esa voz portadora aplicando el timbre del *voicebank* seleccionado, con guía de F0 mediante RMVPE, CREPE, FCPE o un método híbrido. Cuarto, una etapa de *mastering* aplica compresión, reverb y limitación suave.

La innovación técnica destacable es el uso de la propia interpretación sintética como voz portadora: como el carrier ya contiene la melodía y el *timing* exactos, la guía de F0 de RVC preserva la expresividad de la partitura mientras sustituye el timbre. El *setup* descarga ContentVec, RMVPE, FCPE y el diccionario CMU (aproximadamente 600 MB) e instala PyTorch y el *stack* de inferencia RVC en un entorno `.venv-rvc` gestionado con `uv`. No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, ya que no hay un modelo base entrenado por el autor.

## Capacidades

- Síntesis de voz cantada a partir de una partitura: piano roll con dibujo, arrastre, redimensionado, duplicado, selección por marco, letras por nota y velocidad.
- Conversión letras a fonemas con CMUdict completo e inspector de fonemas por nota con *timing*.
- Interpretación expresiva: *portamento*, vibrato retardado, *scoops*, soplo, brillo, desplazamiento de formantes, *jitter* y dinámica.
- Conversión de timbre mediante *voicebanks* RVC v1 y v2 compatibles con Applio, RVC WebUI y otros entrenadores.
- Controles RVC: *voicebank*, desplazamiento de tono, ID de hablante, método de F0 (RMVPE, CREPE, FCPE, híbrido), tasa de índice, *protect* y envolvente de volumen.
- Bus de mezcla con ganancia y silencio por pista, compresor, reverb, ganancia maestra y limitador suave.
- Comparación A/B entre la voz convertida y el carrier DSP sin procesar.
- Gestión de proyectos en JSON, con plantillas de demo y de proyecto vacío.
- Interfaz web sin *build step* ni CDN, servida por Gradio/FastAPI o por un servidor *stdlib* sin dependencias.
- Cuatro temas predefinidos más un tema personalizado de tres colores.
- Atajos de teclado para reproducción, *render*, herramientas, deshacer/rehacer, guardado y edición de notas.
- No soporta *tool calling*, razonamiento multi-paso ni procesamiento de visión o audio de entrada; no es un modelo de lenguaje.

## Casos de uso

- Producción de maquetas vocales para composición: un compositor dibuja la melodía y las letras en el piano roll y obtiene un WAV cantado en segundos, lo que permite iterar sobre la melodía antes de contratar un vocalista.
- Doblaje de canciones con *voicebanks* personalizados: un usuario entrena un *voicebank* RVC con su propia voz y lo aplica a partituras existentes para generar versiones cantadas con su timbre.
- Creación de contenido para *covers* y vídeos musicales: el flujo partitura → fonemas → RVC permite generar pistas vocales completas sin grabar interpretaciones reales.
- Prototipado rápido en CPU: al funcionar sin GPU (una frase de 10 segundos tarda entre 20 y 60 segundos con RMVPE en CPU), sirve para equipos sin acelerador hardware que necesitan validar ideas musicales.
- Investigación y docencia sobre conversión de voz: el código separa claramente G2P, síntesis de formantes, conversión RVC y *mastering*, lo que lo hace útil para estudiar cada etapa del *pipeline* de forma aislada.
- Generación de voces para animación y *fan projects*: la combinación de temas visuales (incluido el tema por defecto inspirado en Asuka Langley Soryu) y la exportación A/B facilita la producción de contenido derivado con fines no comerciales, siempre que la licencia del *voicebank* lo permita.
- Pruebas de *voicebanks* RVC: la comparación A/B entre carrier DSP y voz convertida permite evaluar la calidad de un *voicebank* recién entrenado sobre una partitura controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta datos de latencia cualitativos: una frase de 10 segundos se convierte en unos pocos segundos en GPU y en 20-60 segundos en CPU con RMVPE. No se documentan métricas objetivas como MOS, MCD ni comparaciones con otros sistemas de síntesis cantada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el *stack* RVC con PyTorch y los modelos auxiliares (ContentVec, RMVPE, FCPE) suele requerir entre 2 y 6 GB de VRAM en GPU, aunque la model card no lo especifica.
- GPU recomendadas: no disponible; la model card solo menciona que funciona en CPU y que en GPU la conversión es más rápida.
- Compatibilidad con GPU de consumo: la model card indica que las máquinas solo-CPU funcionan, por lo que cualquier GPU de consumo con suficiente VRAM para PyTorch debería servir, aunque no se enumeran modelos concretos.
- Opciones de despliegue: aplicación local con `start.bat` (Gradio/FastAPI en `http://127.0.0.1:8777` o servidor *stdlib* de reserva) y `setup_rvc.bat` para instalar el entorno `.venv-rvc` con `uv`, Python 3.12, PyTorch y el *stack* de inferencia RVC.
- Latencia y *throughput*: una frase de 10 segundos tarda unos pocos segundos en GPU y 20-60 segundos en CPU con RMVPE. No se documentan más cifras.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AsukaRVC-SVC | Pipeline DSP + RVC para canto | no disponible (sin pesos propios) | no aplica | no disponible | Hugging Face (Asukaa02/AsukaRVC-SVC) |
| RVC WebUI / Applio | Conversión de voz RVC | Depende del *voicebank* | no aplica | según proyecto | Repositorios públicos |
| DiffSinger | Síntesis cantada basada en difusión | no disponible en esta ficha | no aplica | según proyecto | Repositorios públicos |
| Vocaloid / Synthesizer V | Sintetizadores comerciales de canto | no disponible | no aplica | comercial | Productos comerciales |

No se dispone de datos de rendimiento comparativo entre AsukaRVC-SVC y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto libre, no razona y no responde preguntas. Cualquier uso como chatbot o asistente es inadecuado.
- Licencia no especificada: no se puede confirmar el uso comercial del código ni de los *voicebanks* generados; es imprescindible verificar la licencia antes de cualquier despliegue en producción.
- Idiomas: el G2P se basa en CMUdict (inglés) con un *fallback* por reglas; el soporte para castellano u otras lenguas no está documentado y probablemente sea deficiente.
- Dependencia de *voicebanks* de terceros: la calidad final depende del `.pth` y del `.index` aportados por el usuario, con las implicaciones legales y éticas que conlleva clonar voces ajenas.
- Riesgo de artefactos: la conversión RVC puede introducir ruido, inestabilidad en F0 o pérdida de naturalidad, especialmente en CPU y con *voicebanks* de baja calidad.
- Sin benchmarks ni métricas objetivas: no hay evidencia publicada de calidad subjetiva (MOS) ni comparaciones formales con otros sistemas.
- Requiere descarga de aproximadamente 600 MB de modelos auxiliares y un entorno Python separado (`.venv-rvc`) para habilitar RVC; sin él, la aplicación funciona solo con el sintetizador DSP.
- Proyecto con 0 descargas y 0 *likes* en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- La fecha de creación del repositorio (2026-11-19) es posterior a la fecha habitual de consulta; conviene verificar la vigencia y actividad del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/Asukaa02/AsukaRVC-SVC
- Documentación de `uv`: https://docs.astral.sh/uv/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
