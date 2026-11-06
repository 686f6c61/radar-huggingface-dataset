# LeonaQuantum/leonaq-1.5-mini-mac-optimized

## Resumen

Leona-Q 1.5 Mini — Mac Optimized es un paquete de inferencia publicado por LeonaQuantum que adapta el modelo base `LeonaQuantum/leonaq-1.5-mini` para su ejecución local en Apple Silicon mediante llama.cpp con backend Metal. No se trata de un modelo reentrenado ni de una nueva cuantización: el repositorio distribuye binarios ARM64, parches sobre llama.cpp y scripts de orquestación (`mac.py`, `fetch.py`, `build.py`) que descargan y verifican los pesos Q4_K_M originales de 1,56 GB desde el repositorio del editor original. El modelo base conserva las 42 capas transformer y las dos capas de circuito cuántico aprendido que caracterizan a la familia Leona-Q.

La relevancia técnica del paquete reside en que el modelo base incorpora capas de circuitos cuánticos simulados clásicamente mediante statevector, algo que las herramientas estándar (llama.cpp sin parches, LM Studio, Transformers) no ejecutan tal cual. Este repositorio proporciona el runtime necesario para que esas capas se evalúen en macOS 15 o superior sobre hardware Apple, con optimizaciones C++ específicas (arrays separados real/imaginario para SIMD, permutaciones CNOT precalculadas, reutilización de estados iniciales) y una inicialización Metal selectivamente paralela con fallback bajo demanda.

El paquete está pensado para desarrolladores que quieran probar el modelo en un Mac con recursos limitados: el escenario de referencia es un M1 con 7 núcleos GPU y 8 GB de RAM. Incluye un modo opcional de generación especulativa verificada en el que cada token propuesto se comprueba contra el modelo completo y el circuito, sin modelo borrador auxiliar. La licencia es Apache 2.0 y los idiomas declarados son inglés y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 42 capas y 2 capas de circuito cuántico aprendido (simulación clásica de statevector) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens por defecto (configurable con `--context`) |
| Tipos de cuantizacion | Q4_K_M (pesos base oficiales); KV cache en F16 |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos base descargados aparte, 1,56 GB); binarios ARM64 y parches de llama.cpp en el repo |

## Arquitectura y entrenamiento

El modelo base es un transformer de 42 capas que incorpora dos capas de circuito cuántico aprendido evaluadas mediante simulación clásica de statevector; no requiere hardware cuántico. El paquete Mac Optimized no modifica ni reentrena estos pesos: conserva el checkpoint "learned butterfly" y ambas capas de circuito del modelo original. La innovación del repositorio está en el runtime, no en el modelo: parches sobre llama.cpp que optimizan la evaluación de los circuitos (separación de arrays real/imaginario para permitir vectorización SIMD del compilador, permutaciones CNOT fijas preparadas de antemano, reutilización de estados iniciales y normas de amplitud), inicialización Metal parcialmente paralela con fallback completo para operadores no preparados al arranque, y dimensionado de microbatch físico en función de la RAM disponible (128 para equipos de hasta 8 GB, 256 hasta 16 GB, 512 para equipos mayores) sin reducir contexto ni precisión.

El paquete incluye un modo opcional de generación especulativa verificada: cada token propuesto se valida contra el modelo objetivo completo y el circuito, manteniendo las reducciones matriz-vector en F32 y sin emplear modelo borrador ni corpus de respuestas guardadas. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva con modo de razonamiento activo por defecto (el límite de tokens incluye el razonamiento y puede truncar la respuesta).
- Razonamiento multi-paso mediante cadenas de pensamiento internas.
- Evaluación de circuitos cuánticos aprendidos simulados clásicamente, integrada en el grafo de inferencia.
- Soporte multilingüe limitado a inglés y japonés según la model card.
- Servidor HTTP local con interfaz de chat incluida (`python3 mac.py --server`, accesible en `http://127.0.0.1:8080`).
- Modo CLI para peticiones individuales con control de `--max-tokens`.
- Calibración automática por máquina (`--tune`) que mide configuraciones de hilos y aceleración con puertas de regresión (mejora agregada mínima del 5 %, ninguna prueba más de un 10 % más lenta).
- Generación especulativa verificada opcional con coincidencia bit a bit respecto a la referencia estándar en las pruebas publicadas.
- No se documenta soporte de tool calling, function calling ni visión en la información disponible.

## Casos de uso

- Evaluación local de modelos con capas cuánticas simuladas: el paquete es la única vía documentada para ejecutar las capas de circuito de Leona-Q 1.5 Mini en un Mac, lo que lo hace adecuado para investigadores que quieran inspeccionar el comportamiento del modelo sin montar un entorno Linux con CUDA.
- Prototipado en equipos de gama entrada Apple Silicon: con 8 GB de RAM y un M1 de 7 núcleos GPU como referencia, permite probar generación de texto y razonamiento en un portátil sin GPU dedicada, ajustando el microbatch físico a 128.
- Desarrollo de asistentes en japonés e inglés: el modelo declara soporte para ambos idiomas, por lo que sirve para prototipos de chat bilingües con contexto de 4096 tokens, suficiente para conversaciones multi-turno moderadas.
- Experimentación con decodificación especulativa verificada: el modo `--acceleration verified` permite estudiar el equilibrio entre velocidad y verificación exacta en un modelo pequeño, con métricas por tarea incluidas en `V2_RESULTS.md`.
- Calibración y benchmarking en hardware Apple: el script `--tune` genera perfiles ligados a la identidad CPU/GPU, RAM, versión de macOS y hashes del runtime, útil para construir líneas base reproducibles en flotas de Macs.
- Integración en flujos de trabajo con llama.cpp: al apoyarse en llama.cpp parcheado, los binarios pueden incorporarse a scripts existentes que ya invoquen `llama-cli` o `llama-server`, siempre que se respete la ruta `build-metal/bin` para las compilaciones locales.
- Docencia y demostraciones de computación cuántica simulada: el modelo permite mostrar cómo se integran circuitos cuánticos parametrizados en un transformer sin necesidad de acceso a hardware cuántico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card remite a `EVALUATION.md` para puntuaciones upstream, pero advierte explícitamente de que no son mediciones de precisión nuevas en Mac.

Los únicos datos de rendimiento publicados son internos del runtime:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Throughput agregado en modo verificado | 1,136x respecto a la configuración estándar | Comparación local de 4 tareas; 2 hilos en verificado frente a 4 en estándar; incluye procesamiento de entrada |
| Coincidencia de tokens (verificado vs. estándar) | 2.658 tokens idénticos en dos repeticiones | Modo verificado |
| Coincidencia adicional | 1.024 tokens (ocho temas) y 256 tokens (temperatura 0,7) | Verificación separada |
| Coincidencia de salidas GPU | 86.032 floats idénticos bit a bit en 5 variantes; 16.384 valores en kernels de batch | Pruebas de desarrollador |
| Suites de pruebas superadas | 6 | Pruebas de desarrollador |
| Tolerancia numérica en reescritura CPU del circuito | Diferencia absoluta máxima 2e-5 | Debida a redondeo en coma flotante |

El autor advierte de que algunas entradas fueron más lentas en modo verificado y que los tiempos repetidos variaron sustancialmente; no se trata de una afirmación de velocidad universal.

## Requisitos de hardware

- macOS 15 o superior obligatorio para los binarios ARM64 incluidos.
- Equipo de referencia probado: Apple M1, 7 núcleos GPU, 8 GB de RAM unificada, macOS 15.5. La compatibilidad y el rendimiento en otros Macs no se han medido.
- VRAM/RAM estimada: los pesos base Q4_K_M ocupan 1,56 GB; el microbatch físico por defecto es 128 para equipos de hasta 8 GB, 256 hasta 16 GB y 512 para equipos mayores, dimensionado para limitar memoria temporal sin reducir contexto ni precisión.
- Contexto por defecto de 4096 tokens con KV cache en F16 y una sola ranura de servidor.
- Cabe en GPU de consumo Apple Silicon de gama entrada (M1 de 8 GB); no se documenta soporte para GPU NVIDIA ni AMD en este paquete.
- Opciones de despliegue: runtime propio incluido (`mac.py --server`), binarios llama.cpp parcheados en `bin/`, `baseline/bin/` y `v1/bin/`; compilación local con `build.py --backend metal --portable --verified-speculation`. Los Macs Intel pueden compilar con `--backend cpu`. LM Studio, llama.cpp estándar y Transformers no ejecutan el adaptador tal cual.
- Latencia y throughput: solo se publica la comparación relativa de 1,136x del modo verificado; no hay cifras absolutas de tokens por segundo en la información disponible.
- Requisitos de compilación: Python 3.12+, CMake y Xcode Command Line Tools.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base pertenece a una familia propietaria de LeonaQuantum con capas de circuito cuántico que no tiene equivalentes directos documentados en la información disponible, y no se han publicado parámetros totales ni resultados de benchmarks que permitan una comparación cuantitativa con alternativas de tamaño similar.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Leona-Q 1.5 Mini (Mac Optimized) | no disponible | 4096 | Apache 2.0 | GGUF + runtime propio | Capas de circuito cuántico simulado; solo Apple Silicon |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información disponible |

## Limitaciones y advertencias

- El paquete solo se ha probado en un M1 con 7 núcleos GPU y 8 GB de RAM; el rendimiento y la compatibilidad en otros Macs no están medidos.
- Los binarios incluidos requieren macOS 15 o superior y son ARM64; no se genera binario universal Intel/ARM con `--portable`.
- El modelo base no se ejecuta correctamente en llama.cpp estándar, LM Studio ni Transformers sin los parches incluidos; usar herramientas convencionales producirá resultados incorrectos o fallos.
- El modo de razonamiento está activo por defecto y consume parte del límite de `--max-tokens`, lo que puede truncar respuestas; el lanzador no lo desactiva para aparentar mayor velocidad.
- El modo de aceleración verificada puede ser más lento en algunas entradas y los tiempos repetidos varían sustancialmente; la cifra de 1,136x no es una garantía universal.
- Las comprobaciones de coincidencia bit a bit son finitas y no establecen precisión universal ni identidad entre dispositivos; la reescritura CPU del circuito introduce diferencias de redondeo de hasta 2e-5 en valor absoluto.
- Otros procesos del sistema pueden agotar la memoria disponible aunque el microbatch físico esté limitado.
- Idiomas limitados a inglés y japonés; no se documenta soporte de español ni de otros idiomas.
- No se documentan capacidades de tool calling, visión ni audio.
- Riesgo de alucinación y sesgos: no se han publicado evaluaciones de sesgo ni de fidelidad factual en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base se descarga desde el repositorio del editor original y está sujeto a su propia licencia, que debe verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LeonaQuantum/leonaq-1.5-mini-mac-optimized
- Modelo base: https://huggingface.co/LeonaQuantum/leonaq-1.5-mini
- Resultados V2 del runtime: `V2_RESULTS.md` (incluido en el repositorio)
- Resultados V1 del runtime: `MAC_RESULTS.md` (incluido en el repositorio)
- Evaluación upstream: `EVALUATION.md` (incluido en el repositorio)
