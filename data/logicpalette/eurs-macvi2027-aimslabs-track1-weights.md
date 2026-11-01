# LogicPalette/eurs-macvi2027-aimslabs-track1-weights

## Resumen

`LogicPalette/eurs-macvi2027-aimslabs-track1-weights` es un paquete de pesos publicado por el equipo aimslabs para su participacion en la pista 1 (Track 1) del desafio MaCVi 2027 EURS, asociado a la conferencia WACV 2027. No se trata de un modelo de lenguaje, sino de un conjunto de modelos de vision por computador orientados a dos tareas concretas en el dominio subacuatico: restauracion de imagen (*image restoration*) y segmentacion semantica (*semantic segmentation*). El repositorio contiene un unico archivo ZIP de 11.645.483.131 bytes (aproximadamente 11,6 GB, con un tamano de repo de 23,3 GB), cuyo SHA-256 es `d4ce3498fb99bdbf5a9b637598c609b51cd54e369ab2969c07adaa8ab7091afc`, y que debe descomprimirse en la carpeta `weights/` del repositorio de codigo del equipo.

El interes tecnico del paquete radica en su composicion heterogenea: combina una copia sin modificar de SAM 3 (`facebook/sam3`), segmentadores basados en DINOv3, un adaptador LoRA-DPT sobre DINOv3-L de los modelos EPFL CoralscapesV2, un segmentador basado en DINOv2, y arquitecturas Mask2Former y Restormer. Esta mezcla de componentes con licencias distintas (SAM License, DINOv3 License, Apache-2.0 y MIT) es la razon por la que el autor declara una licencia agregada `mixed-see-licenses` en lugar de una licencia unica.

Es relevante ahora porque los entornos subacuaticos presentan degradaciones opticas severas (atenuacion dependiente de la longitud de onda, dispersion, turbidez, iluminacion no uniforme) que rompen los modelos de vision entrenados en imagenes aereas o terrestres. Un paquete de pesos especializado, con codigo publicado y trazabilidad criptografica del archivo, permite reproducir el pipeline de un equipo participante en un benchmark reciente. No obstante, la informacion disponible es muy limitada: no hay model card detallada, no se declaran parametros, contexto ni idiomas, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de modelos de vision: SAM 3 (segmentacion promptable), segmentadores DINOv3, LoRA-DPT sobre DINOv3-L, segmentador DINOv2, Mask2Former, Restormer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision; no disponible la resolucion de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (vision); no disponible |
| Licencia | `other` / `mixed-see-licenses` (mezcla de SAM License, DINOv3 License, Apache-2.0 y MIT) |
| Formato de pesos | ZIP unico `aimslabs_eurs_t1_weights.zip` (11.645.483.131 bytes); formato interno de cada checkpoint no disponible |

## Arquitectura y entrenamiento

El paquete no define una arquitectura unica, sino que agrupa varios componentes con roles complementarios dentro de un pipeline de vision subacuatica. Por un lado, Restormer (bajo licencia MIT) es un transformer de restauracion de imagen basado en mecanismos de atencion multicabezal con sesgo transaccional, habitual en tareas de desruido, desenfoque y mejora de imagenes degradadas. Por otro, la segmentacion se cubre con Mask2Former (MIT), un transformer de segmentacion universal que formula la tarea como prediccion de mascaras y etiquetas, y con segmentadores construidos sobre los backbones DINOv3 y DINOv2, incluyendo un adaptador LoRA-DPT sobre DINOv3-L de los modelos EPFL CoralscapesV2 (Apache-2.0). SAM 3 aporta segmentacion promptable y se incluye como copia sin modificar de `facebook/sam3`.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de tecnicas de ajuste fino supervisado, RLHF/DPO (no aplicables en este dominio) ni innovaciones como decodificacion especulativa. La model card unicamente indica que el paquete se construyo con DINOv3 y SAM 3, y que el archivo debe descomprimirse en la carpeta `weights/` del repositorio de codigo para su uso. Cualquier detalle adicional sobre hiperparametros, regimen de entrenamiento o estrategia de aumento de datos debe consultarse en el repositorio de GitHub del equipo, no incluido en la informacion proporcionada.

## Capacidades

- Restauracion de imagenes subacuaticas: correccion de degradaciones opticas propias del medio acuatico (atenuacion cromatica, dispersion, perdida de contraste).
- Segmentacion semantica de escenas subacuaticas: generacion de mascaras por clase sobre imagenes restauradas o sin restaurar.
- Segmentacion promptable mediante SAM 3: posibilidad de obtener mascaras a partir de indicaciones (puntos, cajas u otras prompts) segun la interfaz de SAM 3.
- Segmentacion densa con Mask2Former y backbones DINOv3/DINOv2: cobertura de clases multiples en entornos con baja visibilidad.
- Ajuste fino eficiente mediante LoRA: el componente LoRA-DPT sobre DINOv3-L permite adaptaciones con menor coste de parametros.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni multilingue; el paquete es estrictamente de vision.
- No se documentan modos especiales (thinking, audio, vision-lenguaje) en la informacion disponible.

## Casos de uso

- Monitorizacion de arrecifes de coral: aplicar el segmentador para delimitar coberturas de coral, sustrato y especies bentonicas en transectos fotograficos, usando el modulo de restauracion para compensar la perdida de color por profundidad y mejorar la separabilidad de clases.
- Inspeccion de infraestructura sumergida: procesar imagenes de tuberias, cascos o cimentaciones marinas con Restormer y segmentar corrosion, bioincrustacion o danos estructurales antes de una evaluacion por buceadores o ROV.
- Cartografiado bentonico con vehiculos autonomos: integrar el pipeline en la carga util de un ROV o AUV para segmentar el fondo marino fotograma a fotograma, aprovechando la segmentacion promptable de SAM 3 para refinar regiones de interes detectadas por el segmentador denso.
- Conteo y seguimiento de fauna marina: segmentar individuos y sustrato en imagenes de camaras trampa subacuaticas, con la restauracion previa como paso para reducir falsos negativos en aguas turbias.
- Investigacion en vision subacuatica: usar los pesos como linea base reproducible en experimentos de comparacion de arquitecturas (Mask2Former frente a DPT con DINOv3/DINOv2) sobre el mismo conjunto de datos del desafio EURS.
- Evaluacion de tecnicas de restauracion: medir el efecto de Restormer sobre metricas de segmentacion aguas abajo, aislando la contribucion de la restauracion al rendimiento final del pipeline.
- Docencia y reproduccion de resultados: al incluir codigo publico y un hash SHA-256 del archivo, el paquete sirve para replicar exactamente los resultados de un equipo en un benchmark academico reciente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas del desafio MaCVi 2027 EURS ni comparaciones numericas con otras propuestas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El paquete completo ocupa 11,6 GB comprimido, pero el espacio en memoria depende de que componentes se carguen simultaneamente; SAM 3, Mask2Former con backbone DINOv3-L y Restormer son modelos de distinto orden de magnitud y no se documenta su consumo individual.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano de los backbones implicados (DINOv3-L, SAM 3), es razonable esperar requisitos de GPU de gama alta o profesional, pero no se confirma con datos del autor.
- Compatibilidad con GPU de consumo: no disponible; no se puede afirmar que quepa en tarjetas consumer concretas sin datos de parametros y resolucion de entrada.
- Opciones de despliegue: el autor solo indica descomprimir el ZIP en la carpeta `weights/` del repositorio de codigo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aqui).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de otros equipos en el desafio MaCVi 2027 EURS ni especificaciones de los componentes individuales (SAM 3, DINOv3, Mask2Former, Restormer) que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La licencia es `mixed-see-licenses`: cada componente del ZIP tiene su propia licencia (SAM License, DINOv3 License, Apache-2.0, MIT) y el uso comercial debe verificarse archivo por archivo contra `LICENSES/README.md` dentro del ZIP. La SAM License y la DINOv3 License no son licencias permisivas estandar y pueden imponer restricciones adicionales.
- No hay model card detallada: se desconocen parametros, datos de entrenamiento, resolucion de entrada y regimen de evaluacion, lo que dificulta auditar el comportamiento del modelo.
- Riesgo de sobreajuste al dominio del desafio: los pesos estan entrenados para el conjunto EURS y su generalizacion a otras aguas, camaras o profundidades no esta documentada.
- Riesgo de alucinacion en segmentacion: en imagenes muy degradadas o con clases poco representadas, el modelo puede producir mascaras espurias o asignaciones erroneas de clase; no se reportan metricas de calibracion.
- Dependencia de codigo externo: los pesos no son utilizables por si solos; requieren el repositorio de GitHub del equipo y su pipeline de preprocesado.
- Sesgos conocidos: no documentados. En vision subacuatica es habitual un sesgo hacia condiciones de iluminacion y tipos de sustrato presentes en el conjunto de entrenamiento.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- El ZIP es un archivo almacenado (no comprimido de forma efectiva), por lo que se necesita espacio en disco equivalente al tamano del archivo antes de descomprimirlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LogicPalette/eurs-macvi2027-aimslabs-track1-weights
- Codigo del equipo: https://github.com/RishiiGamer2201/eurs-macvi2027-aimslabs-track1
- SAM 3 (facebook/sam3): https://huggingface.co/facebook/sam3
