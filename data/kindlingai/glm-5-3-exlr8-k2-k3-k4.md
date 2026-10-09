# kindlingai/glm-5.3-exlr8-k2-k3-k4

## Resumen

`kindlingai/glm-5.3-exlr8-k2-k3-k4` es una cuantizacion del modelo GLM-5.3 de Zhipu AI (zai-org), publicada por el usuario kindlingai. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 744B parametros totales, 256 expertos enrutados por capa, 75 capas MoE, tres capas densas iniciales (0-2) y una capa MTP adicional (la 78). La cuantizacion emplea el formato propietario exlr8 v2, derivado de la codificacion trellis de EXL3 (estilo QTIP), y esta disenada especificamente para dispositivos con memoria unificada de clase NVIDIA GB10 (128 GB de LPDDR5X, ~220 GB/s de ancho de banda de streaming).

La novedad principal es que el repositorio almacena cada experto enrutado simultaneamente a tres anchuras de trellis (K2, K3 y K4), y la anchura efectiva se elige en tiempo de carga mediante un manifiesto, sin necesidad de recodificar. Se incluyen tres manifiestos: `home` (~3.25 bits por peso efectivos), `down1` (~2.25 bpw) y `up1` (4.0 bpw). El objetivo declarado es servir el modelo en configuraciones de tensor parallelism de 3 a 7 ranks (TP=4, 5 y 6 como objetivos principales), reduciendo los bytes de pesos de experto leidos por paso de decodificacion, que es el cuello de botella en decodificacion con concurrencia mayor que 1.

El estado actual del repositorio es "draft / preview" (version 0.3, git tag `v0.3`). El autor indica que las pruebas end-to-end (acuerdo de TP, KL sobre datos reservados frente a BF16 y velocidad de decodificacion) estan en ejecucion, y que las metricas de la model card se actualizaran a medida que se obtengan. El tamano del repositorio es de 837,5 GB y acumula 11.322 descargas y 11 me gusta en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (256 expertos enrutados, 75 capas MoE, capas densas 0-2, capa MTP en la 78); cuantizacion trellis EXL3 / exlr8 v2 |
| Parametros totales | 744B (modelo base GLM-5.3) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exlr8 v2 (trellis EXL3 con codebook E4M3), anchuras K2, K3 y K4 almacenadas simultaneamente; manifiestos `home` ~3.25 bpw, `down1` ~2.25 bpw, `up1` 4.0 bpw |
| Idiomas soportados | no disponible |
| Licencia | `other`, con `license_name: glm-5.3` y `license_link: LICENSE` (archivo LICENSE incluido en el repo) |
| Formato de pesos | safetensors con codigos trellis empacados (16K int16 little-endian en orden de tensor cores, compatible con `pack_trellis` de exllamav3) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer de tipo Mixture of Experts con 744B parametros, 256 expertos enrutados por capa, 75 capas MoE, 3 capas densas iniciales y una capa MTP (Multi-Token Prediction) adicional identificada como capa 78. Esta publicacion no entrena el modelo: cuantiza los pesos BF16 del modelo base `zai-org/GLM-5.3-BF16`. Por tanto, la composicion del dataset de entrenamiento, el numero de tokens y las fases de RLHF/DPO no se detallan en la informacion disponible.

La innovacion tecnica reside en el formato de cuantizacion exlr8 v2, que reutiliza la codificacion trellis de EXL3 (codigos estilo QTIP donde cada mosaico de 16x16 es un camino a traves de un trellis de 16 estados, con cada peso aportando K bits nuevos hallados por busqueda de Viterbi sobre el codebook mcg) y la reorganiza en cuatro frentes. Primero, redondea los valores del codebook a FP8 E4M3 dentro de la propia busqueda de Viterbi, de modo que los pesos decodificados son exactamente FP8 y el prefill se ejecuta sobre tensor cores FP8; redondear despues de la busqueda costaria un 4,0 % (K3) o un 15,3 % (K4) mas de error, y un decodificador EXL3 estandar que leyera los mismos ficheros obtendria un 2,3 % adicional. Segundo, el almacenamiento orientado al despliegue guarda cada experto enrutado en las tres anchuras y la anchura se elige por mitad de experto en tiempo de carga desde un manifiesto, con granularidad de 128 canales emparejados en fragmentos de 256 canales. Tercero, aplica una unica rotacion de activacion por punto de fan-out: cada peso se decodifica como `w = R(diag(suh)·L(T))·diag(svh)`, con signo, escala y una Hadamard fija de 128 bloques por lado; los signos de entrada y las escalas constantes por bloque se comparten entre todos los expertos y anchuras, de forma que el kernel rota la activacion del token una sola vez y comparte un unico operando A entre todos los expertos activos (el prefill de MoE en la capa 40 baja de 23,07 a 18,67 ms), con una perdida de calidad despreciable (ratio NMSE de 0,9996 a 1,0003). El redondeo se calibra con LDLQ frente a hessianos de activaciones reales, lo que reduce el error en capa reservada un 14 % respecto a un hessiano identidad, mientras que el redondeo al mas cercano es entre 2,3 y 33 veces peor. Cuarto, emplea un diseno nativo de MoE/TP: la regla de sharding `(16e + h + L) mod N` cubre cualquier numero de ranks TP entre 3 y 7 sin re-layout, los kernels indexan expertos mediante tablas de punteros, cada peso existe una sola vez (eliminando las copias densas y de decodificacion duplicadas de ~3,5 GiB por rank) y los safetensors alineados a 64 KiB permiten la descarga por rangos HTTP de mitades remotas (~75 GB por nodo a TP=4 bajo el manifiesto `home` en lugar del checkpoint completo).

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, heredado del modelo base GLM-5.3.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base, si bien no se documentan de forma detallada en esta model card.
- Codigo y matematicas: no disponible de forma explicita, se asumen las del modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas figura como no disponible).
- Capacidad especial: prediccion multi-token (MTP) a traves de la capa 78, presente en el modelo base y cuantizada en K3 para sus expertos enrutados y compartidos.
- No se declaran capacidades de vision ni de audio.

## Casos de uso

- Inferencia en hardware de memoria unificada de clase GB10: el formato esta disenado explicitamente para dispositivos con 128 GB de memoria unificada LPDDR5X y ~220 GB/s de streaming, donde el cuello de botella es el numero de bytes de pesos de experto leidos por paso. El manifiesto `down1` (~2.25 bpw) permite reducir aun mas el ancho de banda necesario por token.
- Despliegue multi-nodo con tensor parallelism de 3 a 7 ranks: la regla de sharding `(16e + h + L) mod N` cubre cualquier numero de ranks TP entre 3 y 7 sin re-layout, lo que simplifica el escalado horizontal en un cluster pequeno de nodos GB10.
- Servicio de decodificacion con concurrencia elevada: al reducir los bytes leidos por paso (anchuras K2/K3 segun manifiesto), el modelo resulta adecuado para escenarios de decodificacion por encima de concurrencia 1, donde el ancho de banda de memoria es el factor limitante.
- Prefill sobre tensor cores FP8: al redondear el codebook a E4M3, el prefill se ejecuta sobre tensor cores FP8, lo que resulta util en tareas de procesamiento de contexto largo donde el coste computacional del prefill domina.
- Seleccion de calidad por capa o por experto: la granularidad de almacenamiento (mitad de 128 canales emparejadas en fragmentos de 256) y las tablas de error por anchura permiten construir manifiestos que asignen mas bits donde importa y menos donde no, util para ajustar el equilibrio calidad/memoria por despliegue.
- Distribucion eficiente del checkpoint: los safetensors alineados a 64 KiB permiten descargar mitades remotas por rangos HTTP (~75 GB por nodo a TP=4 bajo el manifiesto `home`), lo que facilita el aprovisionamiento incremental de nodos sin transferir los 837,5 GB completos.
- Distribucion en streaming de pesos para servir variantes de cuantizacion: al guardar cada experto en K2, K3 y K4, un mismo checkpoint sirve para distintos perfiles de memoria sin recodificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card declara que las pruebas end-to-end (acuerdo de TP, KL sobre datos reservados frente a BF16 y velocidad de decodificacion) estan en ejecucion y que las metricas se actualizaran. Los unicos datos numericos publicados son de caracter interno al formato de cuantizacion:

| Metrica | Valor |
|---|---|
| Error por redondear despues de la busqueda (K3) | +4,0 % |
| Error por redondear despues de la busqueda (K4) | +15,3 % |
| Error de un decodificador EXL3 estandar leyendo los mismos ficheros | +2,3 % |
| Ratio NMSE con signos compartidos frente a signos por experto | 0,9996-1,0003 |
| Reduccion de error en capa reservada con hessiano calibrado (LDLQ) frente a hessiano identidad | 14 % inferior |
| Penalizacion del redondeo al mas cercano frente a LDLQ | 2,3-33 veces peor |
| Prefill de MoE en capa 40 | 23,07 ms -> 18,67 ms |

## Requisitos de hardware

- Memoria: el modelo esta pensado para dispositivos con memoria unificada de clase NVIDIA GB10, con 128 GB de LPDDR5X y aproximadamente 220 GB/s de ancho de banda de streaming.
- Huella por rank: bajo el manifiesto `home` (3.25 bpw), el checkpoint ocupa unos 75 GB de expertos enrutados por rank a TP=4; el manifiesto `down1` (2.25 bpw) reduce ese volumen y el `up1` (4.0 bpw) lo aumenta.
- Tensor parallelism: soporte para tamanos TP de 3 a 7 ranks; los objetivos principales son TP=4, 5 y 6.
- GPU consumer: no cabe en una GPU de consumo convencional (24-48 GB). El modelo, incluso en la configuracion mas agresiva de 2,25 bpw, requiere del orden de cientos de GB de almacenamiento de pesos repartidos entre varios dispositivos.
- Opciones de despliegue: libreria `trellis` (declarada en HuggingFace) y decodificadores compatibles con exllamav3. Es imprescindible que el cargador aplique un redondeo FP8 E4M3 (round to nearest even, saturante) a cada valor que produce el codebook trellis antes de aplicar los vectores laterales; un decodificador EXL3 estandar que omita ese redondeo lee pesos mediblemente peores de los mismos bytes.
- Latencia y throughput: no disponibles. La model card menciona que las pruebas de velocidad de decodificacion estan en ejecucion.
- Almacenamiento: el repositorio ocupa 837,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Anchura efectiva | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kindlingai/glm-5.3-exlr8-k2-k3-k4 | 744B (MoE) | safetensors trellis exlr8 v2 (K2/K3/K4) | 2.25 / 3.25 / 4.0 bpw segun manifiesto | other (glm-5.3) | HuggingFace, 11.322 descargas |
| zai-org/GLM-5.3-BF16 (modelo base) | 744B (MoE) | safetensors BF16 | 16 bpw | glm-5.3 | HuggingFace |
| Otras cuantizaciones EXL3 de GLM-5.3 | 744B (MoE) | safetensors trellis EXL3 | una unica anchura por tensor | segun autor | no disponible |
| Cuantizaciones GGUF de modelos MoE de escala similar | segun modelo | GGUF | 2-8 bpw segun variante | segun autor | no disponible |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Estado "draft / preview": la model card advierte explicitamente que se trata de un borrador y que las pruebas end-to-end no han finalizado; las metricas de calidad y velocidad pueden cambiar.
- Redondeo obligatorio: los pesos no se pueden usar sin aplicar el redondeo E4M3 descrito. Un cargador que omita el redondeo, o un decodificador EXL3 estandar, produce pesos mediblemente peores de los mismos bytes. Esto limita la interoperabilidad con herramientas de inferencia que no implementen exlr8 v2.
- Hardware restrictivo: el formato esta optimizado para dispositivos GB10 con memoria unificada y ~220 GB/s. En otras plataformas, las ventajas de diseno (rotacion compartida de activaciones, layout MoE/TP nativo) pueden no materializarse o requerir kernels especificos.
- Idiomas soportados: no disponible; no hay informacion sobre cobertura linguistica en esta ficha, por lo que no puede confirmarse el soporte de castellano ni de otros idiomas.
- Longitud de contexto: no disponible en la informacion proporcionada.
- Parametros activos: no disponibles, lo que impide estimar el coste computacional por token.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni tasas de alucinacion. Al tratarse de una cuantizacion del modelo base, hereda los sesgos de este, pero no se aportan datos especificos.
- Restricciones de licencia: la licencia figura como `other`, con nombre `glm-5.3` y enlace a un archivo LICENSE en el repositorio. Es necesario revisar ese archivo antes de cualquier uso comercial, ya que no se especifican aqui los terminos exactos.
- Riesgo de perdida de calidad por la cuantizacion: la propia model card cuantifica un error adicional del 2,3 % en un decodificador EXL3 estandar y penalizaciones de hasta el 15,3 % si el redondeo se aplica fuera de la busqueda, lo que indica que los pesos cuantizados no son exactamente equivalentes a BF16.
- Duplicacion de almacenamiento: al guardar cada experto en tres anchuras, el repositorio ocupa 837,5 GB, mas que una cuantizacion de una sola anchura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kindlingai/glm-5.3-exlr8-k2-k3-k4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
- Licencia: archivo `LICENSE` incluido en el repositorio de HuggingFace (enlace relativo en la model card).
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
