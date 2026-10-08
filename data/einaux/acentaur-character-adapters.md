# einaux/acentaur-character-adapters

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino tres adaptadores LoRA para generación musical. En concreto, `einaux/acentaur-character-adapters` redistribuye tres adaptadores entrenados por DiffSynth-Studio (ModelScope) sobre el modelo base ACE-Step 1.5 XL SFT. Cada adaptador se corresponde con un "carácter" instrumental distinto: batería (`drums/`), guitarra (`guitar/`) y piano o teclados (`piano/`).

Los adaptadores se emplean en el control CHARACTER de ACENTAUR, un instrumento de audio generativo de EINAUX distribuido como plugin nativo AU/VST3 para Logic Pro, Ableton Live y LUNA en macOS. ACENTAUR descarga estos ficheros bajo demanda desde este repositorio; no forman parte de su instalador. El repositorio actúa, por tanto, como espejo de redistribución: los tres `model.safetensors` son byte a byte idénticos a los originales alojados en ModelScope, verificado mediante SHA-256.

La relevancia del repositorio es fundamentalmente práctica: facilita el acceso desde HuggingFace a unos adaptadores cuyo origen está en ModelScope, con las revisiones upstream y los hashes declarados explícitamente. No hay innovación técnica propia por parte de EINAUX, que manifiesta no haber entrenado, convertido ni modificado los ficheros. La licencia de los adaptadores upstream es Apache 2.0 y se mantiene en esta redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (differential LoRA de DiffSynth-Studio) sobre el modelo de difusión musical ACE-Step 1.5 XL SFT |
| Parametros totales | no disponible (cada adaptador ocupa 318.851.840 bytes en safetensors; no se declara el numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de generacion musical, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el condicionamiento es por prompt; no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un unico archivo `model.safetensors` por adaptador) |
| Modelo base | ACE-Step/acestep-v15-xl-sft |
| Framework / libreria | diffsynth-studio |
| Tamano del repositorio | 1,0 GB |
| Adaptadores incluidos | 3 (drums, guitar, piano) |
| Tecnica de entrenamiento | Differential LoRA (DiffSynth-Studio) |
| Pipeline declarado | no disponible |
| Fecha de creacion del repo | 2026-10-07 |
| Ultima actualizacion | 2026-10-07 |

## Arquitectura y entrenamiento

El objeto de este repositorio son adaptadores LoRA, no un modelo completo. La arquitectura subyacente es la del modelo base ACE-Step 1.5 XL SFT, un modelo de generación musical por difusión, y el mecanismo de adaptación es la técnica Differential LoRA documentada por DiffSynth-Studio. Cada adaptador se distribuye como un único tensor `model.safetensors` de 318.851.840 bytes, lo que equivale aproximadamente a 319 MB por adaptador (unos 957 MB si se suman los tres, coherente con el tamaño total declarado del repositorio, 1,0 GB).

No se proporciona información sobre el número de tokens, la composición del dataset de entrenamiento, ni sobre si hubo etapas de RLHF o DPO; estos conceptos, además, no se aplican de forma directa a un modelo de difusión musical. Tampoco se detalla la configuración del LoRA (rango, alpha, módulos objetivo). Lo único verificable es la integridad de los ficheros: el repositorio publica la revisión upstream y el SHA-256 de cada `model.safetensors`, y afirma que los ficheros no han sido modificados por EINAUX.

Las revisiones upstream declaradas son `d662273f813b0cbf322ab13b88fcccef51c40bef` (drums), `2686a8dc29c7463707c7a85fc885eb8edc38bae2` (guitar) y `2dc271b6a0dff36333d63cd3dae2f091cfbbcfe2` (piano). Los tres adaptadores proceden de repositorios de DiffSynth-Studio en ModelScope.

## Capacidades

- Generacion musical condicionada por prompt: los adaptadores modifican el comportamiento del modelo base ACE-Step 1.5 XL SFT para sesgar la generacion hacia un instrumento concreto.
- Refuerzo de bateria: el adaptador `drums/` potencia la presencia y el caracter de la bateria en la mezcla generada.
- Refuerzo de guitarra: el adaptador `guitar/` potencia la guitarra.
- Refuerzo de piano y teclados: el adaptador `piano/` potencia el piano y los teclados.
- Integracion en un instrumento de audio generativo: se usan como parte del control CHARACTER de ACENTAUR, un plugin AU/VST3 para DAW.
- Ejecucion local: la cadena ACENTAUR funciona en local sobre macOS con Apple MLX, segun la documentacion del fabricante.
- Descarga bajo demanda: ACENTAUR recupera estos adaptadores desde este repositorio cuando el usuario los solicita.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo "thinking", vision ni audio de entrada analizado semanticamente como un LLM multimodal.

## Casos de uso

- Produccion musical en DAW: un compositor aplica el adaptador `piano/` dentro del control CHARACTER de ACENTAUR para generar pasajes de teclado con un caracter timbrico mas definido, sin salir de Logic Pro, Ableton Live o LUNA.
- Reemplazo o refuerzo de pistas de bateria: se emplea `drums/` para generar o reforzar la seccion ritmica de una maqueta y evaluar rapidamente distintas direcciones ritmicas antes de grabar con un baterista.
- Composicion de guitarras para maquetas: `guitar/` permite generar capas de guitarra con caracter propio para validar arreglos y estructura antes de la grabacion final.
- Prototipado rapido de ideas: generar variaciones de una misma idea musical alternando adaptadores para comparar como cambia el resultado segun el instrumento reforzado.
- Musica para video, juegos o contenido corto: generacion por lotes de fragmentos instrumentales centrados en piano, guitarra o bateria, con licencia Apache 2.0 en los adaptadores.
- Investigacion sobre Differential LoRA: el repositorio sirve como referencia reproducible para estudiar adaptadores musicales, con revisiones upstream y hashes SHA-256 publicados.
- Auditoria de procedencia de modelos: util para equipos que necesitan verificar que un adaptador concreto es byte a byte identico al original de ModelScope antes de integrarlo en un producto.
- Integracion en pipelines automatizados: al ser safetensors y cargarse con DiffSynth-Studio, los adaptadores se pueden incorporar en scripts de generacion por lotes sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas objetivas (FAD, CLAP score, MOS ni evaluaciones subjetivas) ni comparaciones cuantitativas con los adaptadores originales o con alternativas.

## Requisitos de hardware

- Los adaptadores por si solos ocupan 318.851.840 bytes cada uno (aproximadamente 319 MB); si se cargan los tres a la vez, en torno a 957 MB.
- La VRAM necesaria para inferencia la determina el modelo base ACE-Step 1.5 XL SFT, no los adaptadores; no se dispone de cifras concretas en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible, al depender del modelo base.
- Opciones de despliegue: DiffSynth-Studio como framework de referencia; ACENTAUR como plugin AU/VST3 nativo en macOS con Apple MLX; los adaptadores no se distribuyen en formato GGUF ni se declaran integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / conjunto | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| einaux/acentaur-character-adapters | 3 LoRA de musica | ACE-Step 1.5 XL SFT | no disponible (319 MB por adaptador) | no aplicable | Apache 2.0 | HuggingFace |
| DiffSynth-Studio/acestep15xlsft-lora-drums (y guitar, piano) | LoRA de musica | ACE-Step 1.5 XL SFT | identico (mismo fichero) | no aplicable | Apache 2.0 | ModelScope |
| ACE-Step/acestep-v15-xl-sft | Modelo de difusion musical completo | no aplica | no disponible | no aplicable | no disponible en la informacion proporcionada | HuggingFace |
| Modelos musicales de Stability AI | Modelos generativos de audio | no aplica | no disponible | no aplicable | no disponible en la informacion proporcionada | mencionados en la pagina de transparencia de EINAUX |

La comparación más relevante es que los tres adaptadores de este repositorio son copias sin modificar de los publicados por DiffSynth-Studio en ModelScope; la única diferencia es el canal de distribución y la documentación de procedencia.

## Limitaciones y advertencias

- No se declaran sesgos especificos, pero al ser adaptadores sobre un modelo musical, heredan los sesgos estilisticos y de genero musical del modelo base y de sus datos de entrenamiento.
- Riesgo de alucinacion en el sentido musical: el modelo base puede generar material poco coherente o de baja calidad segun el prompt; los adaptadores solo sesgan el caracter instrumental.
- No hay informacion sobre limites de longitud de generacion, idiomas del prompt ni cobertura estilistica.
- Los adaptadores estan pensados para un modelo base concreto (ACE-Step 1.5 XL SFT); usarlos con otra revision o con otro modelo puede degradar el resultado o fallar al cargar.
- La licencia Apache 2.0 se aplica a los adaptadores; el copyright sigue siendo de DiffSynth-Studio / ModelScope. Debe verificarse por separado la licencia del modelo base antes de un uso comercial.
- Los repositorios upstream no incluyen fichero NOTICE.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- No se proporciona informacion sobre el pipeline de inferencia; la integracion depende de DiffSynth-Studio o de ACENTAUR.
- ACENTAUR es un producto de macOS; sus capacidades locales estan ligadas a Apple MLX, lo que limita su uso en otros sistemas operativos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/einaux/acentaur-character-adapters
- Modelo base en HuggingFace: https://huggingface.co/ACE-Step/acestep-v15-xl-sft
- Adaptador upstream drums (ModelScope): https://modelscope.cn/models/DiffSynth-Studio/acestep15xlsft-lora-drums
- Adaptador upstream guitar (ModelScope): https://modelscope.cn/models/DiffSynth-Studio/acestep15xlsft-lora-guitar
- Adaptador upstream piano (ModelScope): https://modelscope.cn/models/DiffSynth-Studio/acestep15xlsft-lora-piano
- Documentacion de Differential LoRA (DiffSynth-Studio): https://diffsynth-studio-doc.readthedocs.io/zh-cn/latest/Training/Differential_LoRA.html
- Repositorio de DiffSynth-Studio: https://github.com/modelscope/DiffSynth-Studio
- Perfil de einaux en HuggingFace: https://huggingface.co/einaux
- Repositorio acentaur-mlx-models: https://huggingface.co/einaux/acentaur-mlx-models
- Sitio de EINAUX: https://www.einaux.com/
- Pagina de transparencia de ACENTAUR: https://www.einaux.com/transparency/
