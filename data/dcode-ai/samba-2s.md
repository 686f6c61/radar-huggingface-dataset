# Dcode-AI/SAMBA-2s

## Resumen

SAMBA-2s es un codificador de representaciones (encoder) para senales EEG desarrollado por Dcode-AI, entrenado sobre ventanas de 2 segundos a 128 Hz. Forma parte de la familia SAMBA, que aplica arquitecturas basadas en Mamba al procesamiento de electroencefalografia con el objetivo de generar embeddings generalistas reutilizables en multiples tareas downstream (decodificacion de actividad cerebral, deteccion de estados cognitivos, interfaces cerebro-computador). El modelo se publica como extractor de caracteristicas con pesos en safetensors y requiere CUDA para la inferencia.

Con aproximadamente 1,07 millones de parametros, SAMBA-2s es un modelo muy compacto, disenado para ser eficiente en lugar de masivo. Se ha preentrenado sobre datos de varios dispositivos y cohortes (Emotiv, HBN, Muse y DICE), lo que sugiere un esfuerzo por generalizar entre distintos montajes de electrodos y protocolos de registro. El encoder admite otras longitudes de entrada y configuraciones de electrodos distintas a las de su preentrenamiento, lo que amplia su aplicabilidad.

La relevancia actual del modelo reside en la escasez de encoders EEG abiertos y reutilizables: la mayoria de trabajos en BCI entrenan modelos especificos por tarea y dataset. SAMBA-2s propone un enfoque de representacion preentrenada transferible, con una variante hermana (SAMBA-100s) orientada a ventanas temporales mas largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Samba (hibrida Mamba/SSM aplicada a EEG) |
| Parametros totales | 1.065.172 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 2 s a 128 Hz (256 muestras temporales); admite otras longitudes de entrada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de senales EEG, no de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

SAMBA-2s emplea una arquitectura de tipo Samba, que combina mecanismos de espacio de estados (Mamba/SSM) con componentes de atencion, adaptada a series temporales multicanal de EEG. El modelo opera sobre ventanas de 2 segundos muestreadas a 128 Hz y ha sido preentrenado con datos de Emotiv, HBN, Muse y DICE, lo que aporta diversidad de dispositivos y poblaciones. El objetivo de preentrenamiento es generar representaciones (feature extraction), no una tarea supervisada concreta, por lo que su uso previsto es como backbone congelado o ajustable en tareas posteriores.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de ajuste fino supervisado o preferencias. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de la propia naturaleza Mamba del bloque. La referencia al paper (arXiv:2511.18571) es la fuente indicada para los detalles tecnicos completos.

## Capacidades

- Extraccion de caracteristicas (embeddings) a partir de senales EEG en ventanas de 2 segundos a 128 Hz.
- Generalizacion a otras longitudes de ventana y configuraciones de electrodos distintas a las del preentrenamiento.
- Aplicable como backbone para tareas downstream de clasificacion, regresion o decodificacion sobre EEG.
- Integracion con el ecosistema Hugging Face mediante `snapshot_download` y la libreria `samba_eeg`.
- Inferencia acelerada por GPU (requiere CUDA).
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues: es un modelo de senales, no de lenguaje.

## Casos de uso

- Interfaces cerebro-computador (BCI): usar los embeddings de SAMBA-2s como entrada a un clasificador ligero para decodificar intenciones motoras o imagenes mentales en tiempo casi real, aprovechando la ventana corta de 2 s.
- Deteccion de estados cognitivos: extraer representaciones de segmentos EEG para clasificar sueno, fatiga o carga mental en estudios de neuroergonomia, con la ventaja de que el encoder ya ha visto datos de varios dispositivos.
- Analisis clinico asistido: servir como extractor de caracteristicas en pipelines de deteccion de anomalias (por ejemplo, patrones epileptiformes) cuando se dispone de pocos datos etiquetados y se necesita transferencia desde un modelo preentrenado.
- Investigacion en neurociencia: generar embeddings comparables entre cohortes y montajes de electrodos (Emotiv, Muse, HBN, DICE) para estudiar similitudes entre registros heterogeneos.
- Prototipado rapido en BCI de bajo coste: al tener solo ~1,07 M de parametros, puede integrarse en sistemas con recursos limitados una vez entrenado el cabezal de tarea, manteniendo el encoder como componente fijo.
- Benchmarking de modelos EEG: usar SAMBA-2s como linea base reproducible frente a otros encoders en tareas estandar de decodificacion, gracias a su publicacion abierta en Hugging Face y su codigo asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~1,07 M de parametros, los pesos en precision completa ocupan del orden de pocos megabytes. La VRAM real dependera del tamano de lote y de la longitud de las ventanas de entrada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el modelo es lo bastante pequeno para ejecutarse en tarjetas de gama baja (por ejemplo, GTX 1650 o superiores) y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer con CUDA.
- Opciones de despliegue: la model card indica el uso de la libreria `samba_eeg` instalada desde el repositorio de codigo con `pip install -e '.[mamba,hub]'`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAMBA-2s | 1.065.172 | 2 s a 128 Hz (256 muestras) | EEG | no disponible | Hugging Face (Dcode-AI) |
| SAMBA-100s | no disponible | 100 s (variante de ventana larga) | EEG | no disponible | Hugging Face (Dcode-AI) |
| Otros encoders EEG abiertos | no disponible | no disponible | EEG | no disponible | no disponible |

La informacion proporcionada solo permite comparar con la variante SAMBA-100s de la misma familia; no se dispone de datos de benchmarks ni de especificaciones de terceros para una comparativa cuantitativa.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; antes de un uso comercial debe verificarse en el repositorio o contactando con el autor.
- Modelo especializado en EEG: no es un modelo de lenguaje y no ofrece generacion de texto ni capacidades conversacionales.
- La inferencia requiere CUDA segun la model card, lo que limita su uso en entornos sin GPU NVIDIA.
- El preentrenamiento se realizo sobre ventanas de 2 s a 128 Hz; aunque se indica soporte para otras longitudes y montajes, el rendimiento fuera de esa configuracion no esta cuantificado.
- No se han publicado benchmarks ni evaluaciones de sesgo en la informacion disponible; el riesgo de alucinacion no aplica en el sentido habitual, pero si el de representaciones poco fiables en dominios alejados de los datos de preentrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- El modelo se publico con fecha de creacion 2026-11-18 segun los metadatos; conviene confirmar la version y los artefactos antes de integrarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Dcode-AI/SAMBA-2s
- Variante SAMBA-100s: https://huggingface.co/Dcode-AI/SAMBA-100s
- Guia de uso compartida: https://huggingface.co/Dcode-AI/SAMBA
- Proyecto: https://samba.dcode.ai/
- Codigo: https://github.com/Jiazhen-Hong/SAMBA
- Paper: https://arxiv.org/abs/2511.18571
