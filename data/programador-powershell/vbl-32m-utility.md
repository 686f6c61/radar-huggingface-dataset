# programador-powershell/VBL-32M-Utility

## Resumen

VBL-32M-Utility es un checkpoint de investigación de 31.974.240 parámetros publicado por el usuario programador-powershell bajo el identificador `programador-powershell/VBL-32M-Utility`. No es un transformer convencional ni se ejecuta sobre Python/PyTorch: su runtime principal es un binario nativo escrito en Rust para x86-64, optimizado con instrucciones AVX2 y FMA, que carga la totalidad de los pesos FP32 en la RAM del proceso al arrancar, sin mmap y sin streaming desde SSD. El payload neuronal en FP32 ocupa 121,97 MiB.

La arquitectura declarada por el autor es de tipo recurrente (etiqueta `vbl`, `recurrent`) con un esquema de expertos: el grafo activo es `input -> embedding -> prelude -> [V16_NORM_MEAN + state-conditioned elastic bank + shared recurrent core] x R2 -> coda -> tied output`. Combina una base VBL-RC M0 de 20.013.920 parámetros con una capacidad elástica conectada de 11.960.320 parámetros, distribuida en 73 expertos de anchura 320 -> 256 -> 320 con top-k 3 y un router token-causal que comparte `down.weight[0]` y no añade parámetros propios.

El propio autor lo etiqueta como release de utilidad e investigación, no como modelo verificado: el repositorio se llama deliberadamente `Utility` y no `Verified-32M` porque el candidato de 32M obtuvo 583/853 en el resultado oficial congelado C1 y, por tanto, no fue promovido a KR100. El modo de utilidad enruta primero las tareas deterministas a verificadores ejecutables y se abstiene cuando la petición no está soportada, en lugar de fabricar una respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VBL recurrente con banco elástico condicionado por estado y mezcla de expertos (73 expertos, top-k 3); grafo: input -> embedding -> prelude -> [V16_NORM_MEAN + state-conditioned elastic bank + shared recurrent core] x R2 -> coda -> tied output |
| Parametros totales | 31.974.240 |
| Parametros activos | no disponible (el autor no publica el reparto de parámetros activos por token; se conocen 20.013.920 de la base VBL-RC M0 y 11.960.320 de capacidad elástica conectada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ninguno; pesos FP32 (no quantization) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, estado FP32 completo) |

Datos adicionales aportados por el autor: tokenizador VBL-BPE-24K (`tokenizer.json`), configuración de runtime `native_config.json` con prueba de paridad, binario Linux x86-64 AVX2/FMA en `bin/linux-x86_64-v3/vbl32m`, script `native/build-windows-x86_64.ps1` para Windows x86-64, contrato de arquitectura en `ARCHITECTURE.json` y procedencia en `MANIFEST.json` / `SHA256SUMS`. Tamaño del repositorio: 0,1 GB. Alpha experimental seleccionada: 0,75.

## Arquitectura y entrenamiento

El checkpoint activo implementa un núcleo recurrente compartido que se ejecuta dos veces (x R2) sobre una representación que pasa por normalización V16_NORM_MEAN y por un banco elástico condicionado por el estado. Sobre esa base se conecta una capacidad de mezcla de expertos de 73 unidades con anchura 320 -> 256 -> 320 y enrutado top-k 3. El router es token-causal y comparte el tensor `down.weight[0]` de los expertos, de modo que no introduce parámetros adicionales. La suma de la base VBL-RC M0 (20.013.920) y la capacidad elástica conectada (11.960.320) da los 31.974.240 parámetros totales.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se detalla el procedimiento de entrenamiento del router ni la estrategia de balanceo de carga entre los 73 expertos. El autor indica explícitamente una política de honestidad arquitectónica: `ARCHITECTURE.json` marca como inactivas aquellas características aprobadas como direcciones experimentales que no fueron entrenadas ni certificadas en este checkpoint concreto, en lugar de presentarlas como comportamiento aprendido. La residencia completa en RAM desactiva de forma intencionada el streaming predictivo desde SSD.

## Capacidades

- Generación de texto autoregresiva en modo experimental mediante la bandera `--raw`, por ejemplo `./vbl32m --model-dir . --raw "User: What is 2 + 2? Assistant:"`.
- Enrutado de tareas deterministas a verificadores ejecutables: aritmética entera (`"What is 34 + -13?"`), paridad (`"Is 772 even or odd?"`) y completado de secuencias numéricas (`"Complete the sequence: 32, 33, 34, 35,"`).
- Abstención explícita ante peticiones de utilidad no soportadas, en lugar de generar una respuesta inventada.
- Trazado de la convergencia del estado recurrente con `--raw --trace`, útil para depuración e investigación del comportamiento del núcleo recurrente.
- Ejecución nativa en CPU x86-64 con núcleos de producto escalar optimizados para AVX2 y FMA.
- Tokenización BPE propia (VBL-BPE-24K) integrada en el runtime.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Verificación aritmética determinista en pipelines de datos: el modo de utilidad enruta sumas y restas de enteros a verificadores ejecutables, por lo que puede emplearse como comprobador barato en CPU dentro de procesos de validación de datasets sin depender de GPU.
- Clasificación de paridad y propiedades numéricas simples: la tarea `"Is 772 even or odd?"` ilustra un uso como componente de filtrado o etiquetado en preprocesado de corpus numéricos.
- Completado de secuencias numéricas: útil para generar o validar continuaciones de series en tests sintéticos, generación de datos de entrenamiento para tareas de conteo o comprobación de plantillas.
- Entorno de investigación en arquitecturas recurrentes: el binario con `--raw --trace` permite estudiar la convergencia del estado recurrente y el comportamiento del banco elástico en un modelo pequeño que cabe íntegramente en RAM, sin dependencias de PyTorch.
- Despliegue en hardware sin GPU: al no requerir CUDA ni aceleradores, el runtime nativo puede ejecutarse en servidores x86-64 convencionales, contenedores ligeros o máquinas de laboratorio con AVX2 y FMA.
- Reproducción y auditoría de artefactos: la presencia de `MANIFEST.json`, `SHA256SUMS` y `native_config.json` con prueba de paridad permite verificar la integridad del checkpoint y comparar la ejecución nativa con la referencia declarada.
- Base para experimentación con mezcla de expertos de bajo coste: con 73 expertos, top-k 3 y un router sin parámetros adicionales, sirve como banco de pruebas para estudiar enrutado token-causal en modelos de decenas de millones de parámetros.
- Integración en herramientas de línea de comandos: el binario `vbl32m` acepta consultas por argumento, de modo que puede invocarse desde scripts shell o PowerShell para tareas deterministas concretas.

## Benchmarks y rendimiento

El único resultado numérico publicado en la información disponible es la evaluación oficial congelada C1 del candidato de 32M:

| Evaluacion | Resultado | Interpretacion |
|---|---|---|
| C1 (oficial, congelada) | 583 / 853 | No alcanza la promocion KR100, por lo que el repositorio se publica como Utility y no como Verified-32M |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se han publicado métricas de latencia, throughput ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el runtime no requiere GPU. Los pesos se cargan como estado FP32 en RAM, con un payload neuronal de 121,97 MiB, al que hay que sumar el consumo del proceso, el tokenizador y las estructuras del runtime.
- Memoria del sistema: debe poder alojar la totalidad del modelo en RAM del proceso; no hay mmap ni streaming desde SSD, por lo que no se puede paginar parcialmente el modelo.
- CPU: x86-64 con soporte de AVX2 y FMA. El repositorio incluye un binario precompilado para Linux x86-64 en `bin/linux-x86_64-v3/vbl32m` y un script de compilación para Windows x86-64.
- GPU recomendadas: ninguna; no se requiere GPU para el runtime declarado.
- Compatibilidad con GPU de consumo: no aplica, ya que el diseño es exclusivamente CPU.
- Opciones de despliegue: binario nativo (`vbl32m`) en Linux x86-64 y compilación propia en Windows x86-64 con `native/build-windows-x86_64.ps1`. No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La búsqueda web realizada no devolvió información relevante sobre este modelo ni sobre alternativas comparables; los resultados obtenidos trataban sobre software de Adobe y no guardan relación con el modelo. Además, VBL-32M-Utility no es directamente comparable con transformers pequeños convencionales, ya que emplea un runtime nativo en Rust, pesos FP32 sin cuantización y una arquitectura recurrente con banco elástico y mezcla de expertos de diseño propio.

## Limitaciones y advertencias

- El propio autor lo clasifica como release de utilidad e investigación, no como modelo verificado: el resultado C1 de 583/853 impidió su promoción a KR100.
- La generación neuronal en bruto se presenta explícitamente como experimental (`--raw`), por lo que no debe tratarse como un generador de texto fiable en producción.
- El modo de utilidad se abstiene ante peticiones no soportadas; no hay evidencia publicada de cobertura más allá de tareas aritméticas y de secuencias deterministas.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no cuantificado; el diseño mitiga el problema en tareas deterministas mediante verificadores y abstención, pero no hay datos publicados sobre el comportamiento del modo neuronal libre.
- Limitaciones de contexto: la longitud de contexto no está disponible, lo que impide evaluar el comportamiento en conversaciones largas o documentos extensos.
- Idiomas soportados: no disponible; el tokenizador VBL-BPE-24K no viene acompañado de un desglose de cobertura lingüística.
- Licencia: no disponible. Al no especificarse, no puede asumirse permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día, por lo que no existe validación externa ni comunidad de usuarios.
- La residencia completa en RAM sin mmap implica que el modelo no puede ejecutarse en entornos con memoria muy restringida y que el arranque carga la totalidad de los pesos de una vez.
- Las características marcadas como inactivas en `ARCHITECTURE.json` no deben interpretarse como capacidades aprendidas.
- La compilación en Windows requiere tener Rust instalado y ejecutar el script desde el directorio `native`.

## Enlaces

- HuggingFace: https://huggingface.co/programador-powershell/VBL-32M-Utility
- Paper: no disponible
- Blog o nota tecnica: no disponible
- Repositorio de codigo: el codigo fuente Rust se distribuye dentro del propio repositorio de HuggingFace, en el directorio `native/`
- Demo: no disponible
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre este modelo; los resultados devueltos por la busqueda trataban sobre software de Adobe y no guardan relacion con VBL-32M-Utility
