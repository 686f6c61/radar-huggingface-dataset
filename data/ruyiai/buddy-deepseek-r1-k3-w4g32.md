# RuyiAI/buddy-deepseek-r1-k3-w4g32

## Resumen

RuyiAI/buddy-deepseek-r1-k3-w4g32 no es un modelo de lenguaje en el sentido habitual, sino un artefacto compilado de forma cruzada (*cross-compiled*) para la arquitectura RISC-V de 64 bits (`riscv64`). Se distribuye como un paquete `.rax` destinado al runtime [`buddy-cli`](https://github.com/buddy-compiler/buddy-mlir), la herramienta del proyecto buddy-mlir, y su modelo de origen declarado por el autor es [deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B).

El artefacto esta calibrado especificamente para el SoC SpacemiT K3 A100, con VLEN=1024 y soporte de las extensiones Zfh y Zvfh (coma flotante de media precision vectorial). La nomenclatura del repositorio ("k3-w4g32") sugiere pesos cuantizados a 4 bits con tamano de grupo de 32, aunque esta interpretacion no se confirma de forma explicita en la model card.

Su relevancia radica en que ejemplifica el flujo de despliegue de modelos de razonamiento en hardware RISC-V de bajo consumo mediante una cadena de compilacion basada en MLIR, un nicho poco cubierto por los formatos habituales (safetensors, GGUF). El repositorio ocupa unos 2,5 GB y registra un numero de descargas muy bajo (0 descargas, 1 like) en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo de origen DeepSeek-R1-Distill-Qwen-1.5B); el artefacto es un paquete `.rax` compilado para RISC-V |
| Parametros totales | Aproximadamente 1.500 millones (1,5B), segun el modelo de origen declarado |
| Parametros activos | No aplica (el modelo de origen es denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos a 4 bits con grupo de 32 (interpretacion de "w4g32" en el nombre del repositorio; no confirmado en la model card) |
| Idiomas soportados | No disponible (el modelo de origen es multilingue, con predominio de ingles y chino) |
| Licencia | No disponible en el repositorio. El modelo de origen DeepSeek-R1-Distill-Qwen-1.5B se distribuye bajo licencia MIT segun su ficha publica |
| Formato de pesos | `.rax` (paquete compilado para el runtime `buddy-cli`); no se distribuye en safetensors ni GGUF |
| Version del artefacto | `60f354a` |
| Plataforma objetivo | SpacemiT K3 A100 (RISC-V, VLEN=1024, Zfh/Zvfh) |
| Tamano del repositorio | Aproximadamente 2,5 GB |
| Fecha de creacion | 2026-10-16 |

## Arquitectura y entrenamiento

El artefacto no incorpora entrenamiento propio: es el resultado de compilar de forma cruzada un modelo preexistente hacia codigo ejecutable en RISC-V a traves de la cadena de compilacion buddy-mlir, basada en MLIR. El modelo de partida es DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only denso de 1,5B parametros obtenido por destilacion de las trazas de razonamiento de DeepSeek-R1 sobre una base de la familia Qwen2.5. Ese proceso de destilacion produce un modelo orientado a razonamiento paso a paso con cadenas de pensamiento largas, y en el caso del 1.5B prioriza eficiencia sobre capacidad bruta.

La innovacion tecnica de este repositorio no reside en el modelo, sino en el pipeline de despliegue: la conversion a un formato `.rax` especifico del runtime, la compilacion para un target concreto (SpacemiT K3 A100) y la optimizacion para un conjunto de extensiones vectoriales RISC-V (VLEN=1024, Zfh, Zvfh). No se detalla en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original; esa informacion corresponderia a la documentacion de DeepSeek-R1-Distill-Qwen-1.5B y no se reproduce aqui.

## Capacidades

- Generacion de texto y razonamiento encadenado (*chain-of-thought*), heredado de la destilacion de DeepSeek-R1.
- Resolucion de problemas matematicos y de logica de varios pasos, actividad para la que el modelo de origen esta especificamente optimizado.
- Generacion y comprension de codigo a nivel basico, propia de un modelo de 1,5B parametros.
- Ejecucion local en hardware RISC-V de bajo consumo mediante `buddy-cli`, sin necesidad de GPU dedicada.
- Inferencia offline: al distribuirse como paquete compilado, no requiere acceso a red ni a un runtime de Python.
- Soporte de *tool calling* / *function calling*: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso como orquestador: no disponible.
- Capacidades multilingues detalladas: no disponible (se desconoce el desglose de idiomas del artefacto).
- Capacidades de vision o audio: no disponibles; el modelo de origen es exclusivamente de texto.
- Modo de pensamiento (*thinking mode*) explicito configurable: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de razonamiento embebido en placas RISC-V: el paquete `.rax` esta pensado para ejecutarse sobre el SoC SpacemiT K3 A100 con `buddy-cli`, de modo que permite dotar de razonamiento local a dispositivos sin GPU ni conexion a la nube.
- Procesamiento de lenguaje natural en el borde (*edge NLP*): robots, drones o pasarelas IoT basadas en RISC-V pueden ejecutar tareas de resumen, clasificacion o extraccion de informacion sin enviar datos a servicios externos.
- Entornos con requisitos estrictos de privacidad: al ejecutarse integramente en local, es adecuado para aplicaciones donde los datos no pueden salir del dispositivo (sanidad, industria, defensa).
- Demostraciones y banco de pruebas de compiladores ML: sirve como caso de estudio para evaluar el rendimiento de la cadena buddy-mlir y de la vectorizacion RVV en cargas de inferencia reales.
- Formacion e investigacion en arquitecturas RISC-V: util para estudiar como se comporta un modelo de razonamiento cuantizado a 4 bits en un ISA no x86/ARM.
- Aplicaciones de razonamiento matematico de baja latencia en dispositivos autonomos, donde el modelo de origen tiene un sesgo marcado hacia tareas matematicas.
- Prototipado de asistentes de voz o texto en hardware de bajo coste, siempre que el resto del pipeline (ASR, TTS) se ejecute tambien en el propio dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K, MATH-500 u otras), ni metricas de latencia o throughput medidas sobre el SpacemiT K3 A100. Cualquier cifra de rendimiento del modelo de origen DeepSeek-R1-Distill-Qwen-1.5B debe consultarse en su ficha oficial y en el informe tecnico de DeepSeek-R1, y no es extrapolable directamente a este artefacto compilado, ya que la cuantizacion a 4 bits y la recompilacion para RISC-V pueden alterar los resultados.

## Requisitos de hardware

- Hardware objetivo declarado: SoC SpacemiT K3 A100 con RISC-V, VLEN=1024 y extensiones Zfh/Zvfh. Es la unica plataforma mencionada explicitamente en la model card.
- VRAM estimada: no disponible. Al ser un artefacto para CPU RISC-V, el consumo relevante es de memoria principal (RAM) y no de VRAM; un modelo de 1,5B a 4 bits ocupa del orden de 1 GB de pesos mas las estructuras de runtime, aunque no se confirma cifra alguna.
- GPU recomendadas: no aplica al artefacto. Para ejecutar el modelo de origen en su formato nativo, una GPU de consumo con 4-6 GB de VRAM seria suficiente para un modelo de 1,5B en 4 bits, pero este dato no se proporciona para el `.rax`.
- Compatibilidad con GPU de consumo: irrelevante para este paquete, disenado para CPU RISC-V.
- Opciones de despliegue: unicamente `buddy-cli` (runtime del proyecto buddy-compiler/buddy-mlir), instalado mediante el script `install_buddy_cli.sh`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.
- Nota operativa de la model card: la ejecucion requiere escribir `0` en `/proc/set_ai_thread` antes de lanzar el binario, un paso especifico de esta plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Publico objetivo |
|---|---|---|---|---|---|
| RuyiAI/buddy-deepseek-r1-k3-w4g32 | ~1,5B (heredados) | No disponible | `.rax` (buddy-cli) | No disponible en el repositorio | RISC-V SpacemiT K3 A100 |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | No disponible en la informacion proporcionada | safetensors | MIT | GPU/CPU generica, ecosistema PyTorch |
| Cuantizaciones GGUF de la familia DeepSeek-R1-Distill | 1,5B | No disponible | GGUF | No disponible | llama.cpp, CPU y GPU de consumo |

La comparacion se limita al modelo de origen y a formatos de cuantizacion genericos, porque no se han identificado en la informacion disponible otros paquetes `.rax` equivalentes para RISC-V con los que contrastar directamente. Los datos de contexto, licencia y rendimiento de las alternativas no estan confirmados en la documentacion aportada.

## Limitaciones y advertencias

- Licencia no especificada en el repositorio: la ficha de HuggingFace no declara licencia, lo que impide confirmar las condiciones de uso comercial del artefacto compilado. La licencia del modelo de origen (MIT, segun su ficha) no cubre necesariamente la redistribucion del binario recompilado.
- Ausencia total de benchmarks: no hay ninguna medicion publicada de precision, latencia o throughput sobre el hardware objetivo, por lo que el rendimiento real es desconocido.
- Riesgo de degradacion por cuantizacion: si los pesos estan efectivamente a 4 bits (lectura de "w4g32"), cabe esperar perdida de calidad en tareas de razonamiento respecto al modelo en precision completa, aunque no se cuantifica.
- Alucinacion: los modelos de razonamiento pequenos de la familia DeepSeek-R1-Distill tienden a producir cadenas de pensamiento plausibles pero incorrectas en tareas fuera de su dominio, especialmente matematicas y logica avanzadas.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad para este artefacto. El modelo de origen hereda los sesgos de sus datos de entrenamiento y destilacion.
- Dependencia de hardware muy especifico: el paquete solo funciona en la plataforma SpacemiT K3 A100 con el runtime `buddy-cli`; no es portable a x86, ARM ni a otras placas RISC-V sin recompilacion.
- Ecosistema inmaduro: `buddy-cli` y el formato `.rax` no cuentan con el soporte de herramientas, cuantizaciones ni integraciones de llama.cpp, vLLM u Ollama.
- Idiomas no documentados: se desconoce el comportamiento del artefacto en castellano y en idiomas distintos del ingles o el chino, habituales en el modelo de origen.
- Escasa validacion comunitaria: con 0 descargas y 1 like, no existe evidencia externa de funcionamiento correcto ni de reproducibilidad.
- Requisito operativo fragil: la necesidad de escribir en `/proc/set_ai_thread` sugiere una integracion fuertemente acoplada al sistema operativo de la placa, poco adecuada para entornos en contenedor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RuyiAI/buddy-deepseek-r1-k3-w4g32
- Modelo de origen: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Proyecto buddy-mlir: https://github.com/buddy-compiler/buddy-mlir
- Script de instalacion de buddy-cli: https://raw.githubusercontent.com/buddy-compiler/buddy-mlir/main/scripts/install_buddy_cli.sh
- Informe tecnico de DeepSeek-R1 (referencia del modelo de origen): no disponible en la informacion proporcionada
- Documentacion del SoC SpacemiT K3 A100: no disponible en la informacion proporcionada
