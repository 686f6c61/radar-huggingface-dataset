# genome-spy/BPNet-WebGPU

## Resumen

BPNet-WebGPU es un repositorio de pesos para el motor de inferencia en navegador `bpnet-wgsl@1` de GenomeSpy Sequence Designer. No es un modelo generativo ni un LLM: se trata de un atlas completo de contenedores de pesos `GSCNNv1` correspondientes a modelos BPNet de prediccion de perfiles de ChIP-seq a partir de secuencia de ADN. El autor, genome-spy, publica 11.695 folds procedentes de 2.339 repositorios experimentales originales, empaquetados para ejecucion directa sobre WebGPU mediante shaders WGSL.

La relevancia tecnica esta en el formato y el alcance: los pesos se copian en fp32 desde la release ONNX existente sin cuantizacion ni reescritura aritmetica, y se empaquetan como contenedores binarios verificados por tamano y SHA-256. Esto permite desplegar inferencia de genomica funcional en el navegador sin backend servidor, con un coste de memoria de aproximadamente 0,47 MB por fold. El repositorio ocupa 5,6 GB y esta publicado bajo licencia MIT.

Es importante subrayar que la publicacion es prediction-only y no incluye validacion numerica por fold ni ejecuciones de inferencia, tal como solicito el autor. Los pesos son los aprendidos originalmente, pero la equivalencia numerica con la release ONNX no esta certificada en esta publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GSCNNv1 (BPNet, CNN con cabezas de perfil y conteo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.114 bp de anchura de entrada; salida sobre `[557,1557)` |
| Tipos de cuantizacion | fp32 sin cuantizacion (copia directa de inicializadores) |
| Idiomas soportados | no aplica (entrada de secuencia de ADN ACGT) |
| Licencia | MIT |
| Formato de pesos | contenedores binarios propios para `bpnet-wgsl@1`; no son ONNX ni safetensors ni GGUF |

## Arquitectura y entrenamiento

BPNet es una red convolucional (CNN) disenada para predecir perfiles de cobertura de ChIP-seq y conteos totales a partir de secuencia de ADN. La variante empaquetada aqui, `GSCNNv1`, mantiene las cabezas nativas aprendidas: perfil `[1,2,1000]` (dos hebras) y log-count `[1,1]`, con controles apareados de perfil `[1,2,1000]` y de log-count `[1,2]`, incluyendo las cabezas de mezcla aprendidas. La entrada es fp32 ACGT con forma `[1,4,2114]`; las caracteristicas de conteo abarcan 1.074 posiciones desde el offset 520 de la entrada.

El proceso de conversion parte de la release ONNX fijada de BPNet: los inicializadores fp32 se copian sin cuantizacion ni operaciones aritmeticas, y los pesos de convolucion de ChromBPNet divididos se reensamblan por concatenacion exacta de canales. Cada artefacto intermedio se verifica contra su tamano y SHA-256 registrados, y cada contenedor embebe su identidad nativa completa (repositorio, revision, ruta, hash) junto con formas, layouts y rangos de bytes por tensor. No se realizan pruebas de paridad numerica por fold ni ejecuciones de inferencia en esta publicacion. No se dispone de informacion sobre el dataset de entrenamiento original, numero de tokens ni procesos de RLHF/DPO, ya que se trata de modelos genomicos supervisados y no de modelos de lenguaje.

## Capacidades

- Prediccion de perfiles de ChIP-seq (dos hebras) y conteos totales a partir de secuencia de ADN de 2.114 bp.
- Modelos control-aware: incorporan controles apareados de perfil y de log-count, con cabezas de mezcla aprendidas.
- Inferencia en navegador mediante WebGPU y shaders WGSL a traves del motor `bpnet-wgsl@1`.
- Empaquetado verificado por SHA-256 y tamano exacto por tensor y por contenedor.
- Preservacion de identidades nativas por fold, incluyendo repositorios distintos con pesos identicos.
- No incluye: generacion de texto, razonamiento, codigo, tool calling, agentes, vision, audio ni capacidades multilingues.

## Casos de uso

- Exploracion interactiva de genoma en navegador: cargar un fold concreto en GenomeSpy Sequence Designer y visualizar predicciones de perfil y conteo sobre una region de 2.114 bp sin infraestructura de servidor.
- Analisis de accesibilidad y union de factores de transcripcion: usar los perfiles predichos por hebra para comparar regiones candidatas en un estudio de ChIP-seq.
- Reproducibilidad de experimentos publicados: al conservarse la identidad nativa (repositorio, revision, ruta y hash) de cada fold, se puede auditar que pesos corresponden a que experimento original.
- Seleccion de folds para pipelines aguas abajo: descargar unicamente los contenedores relevantes (aproximadamente 0,47 MB por fold) en lugar del atlas completo de 5,6 GB.
- Prototipado de visores genomicos: integrar el motor WGSL en aplicaciones web que necesiten inferencia local sin exposicion de datos a un backend.
- Docencia y demostraciones: ejecutar modelos BPNet reales en un portatil con GPU integrada compatible con WebGPU, sin instalar CUDA ni dependencias pesadas.
- Verificacion de integridad en CI: usar el manifiesto y `SHA256SUMS` para validar que los artefactos descargados coinciden byte a byte con lo publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se realizan pruebas de paridad numerica por fold ni ejecuciones de inferencia en esta publicacion, y que la publicacion no constituye una afirmacion de validacion numerica ni biologica.

## Requisitos de hardware

- VRAM: no disponible de forma agregada; el coste por fold es de aproximadamente 0,47 MB, por lo que un solo fold cabe holgadamente en cualquier GPU con soporte WebGPU.
- GPU recomendadas: cualquier GPU con WebGPU habilitado en el navegador (integradas modernas y dedicadas); no se especifican modelos concretos como A100, H100 o RTX 4090 en la informacion disponible.
- Consumer GPU: si, un fold individual es viable en GPU integradas; el atlas completo de 5,6 GB requiere almacenamiento, no VRAM simultanea.
- Despliegue: exclusivamente mediante el motor `bpnet-wgsl@1` en GenomeSpy Sequence Designer; no se soportan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BPNet-WebGPU | Pesos BPNet/GSCNNv1 para WebGPU | Contenedores binarios WGSL | 2.114 bp | MIT | Hugging Face |
| BPNet-ONNX (genome-spy) | Pesos BPNet en ONNX | ONNX | 2.114 bp | MIT (segun repositorio de origen) | Hugging Face |
| ChromBPNet | CNN de accesibilidad con correccion de sesgo | Pesos nativos/ONNX | no disponible | no disponible | Repositorios originales |

La comparativa se limita a la familia BPNet/ChromBPNet porque no existen alternativas equivalentes de inferencia genomica en navegador con WebGPU documentadas en la informacion disponible.

## Limitaciones y advertencias

- No se han ejecutado pruebas de paridad numerica por fold ni inferencia: la equivalencia con la release ONNX no esta certificada.
- La publicacion no constituye validacion biologica; los resultados deben interpretarse con cautela en contextos cientificos.
- Los controles a cero no implican un ensayo sin sesgo: el logsumexp de dos controles de log-count a cero es `log(2)`, no cero.
- No es una libreria JavaScript autonoma ni incluye codigo de shaders: requiere el motor `bpnet-wgsl@1` propietario de la aplicacion.
- No cubre ensembles, grafos backward, Ledidi, atribucion ni PISA.
- La model card original archivada es historica y no sirve como evidencia de validacion de estos packs WGSL.
- El repositorio ocupa 5,6 GB; la descarga completa puede ser costosa y conviene seleccionar folds concretos.
- No aplica uso comercial mas alla de lo permitido por MIT, pero la dependencia del motor de ejecucion puede condicionar el despliegue en produccion.
- Riesgo de sesgos y alucinacion: no aplica en el sentido de LLM, pero los sesgos del dataset genomico original subyacen a las predicciones.

## Enlaces

- Hugging Face: https://huggingface.co/genome-spy/BPNet-WebGPU
- Release ONNX de origen: https://huggingface.co/genome-spy/BPNet-ONNX
