# itsrealranky/linuxformer

## Resumen

linuxformer es un checkpoint derivado de Qwen3.5-4B que incorpora, mediante 37 capas adicionales calculadas por un compilador y no entrenadas, una CPU RV32IMA + Zicsr capaz de arrancar Linux 6.8 sin MMU hasta un shell BusyBox. El autor es itsrealranky y el modelo base es Qwen/Qwen3.5-4B, cuyos 426 tensores originales se mantienen bit a bit idénticos. El resultado es un artefacto híbrido de 69 capas (37 de chip y 32 de Qwen) con 15.991.921.024 parámetros en bf16, donde el estado recurrente del chip (4,5 MB de RAM y la ROM del kernel) se almacena como estado recurrente Gated DeltaNet.

La relevancia del modelo es fundamentalmente conceptual y experimental: demuestra que es posible incrustar una máquina completa dentro de los pesos de un transformer y hacer que el propio modelo la ejecute token a token, además de exponer esa máquina al LLM como herramienta invocable. No es un modelo de propósito general para producción: requiere drivers específicos del repositorio de código, enrutado de tokens por tipo y, en el modo más rápido, un megakernel escrito para H100.

El checkpoint tiene un tamaño de repositorio de 32,9 GB, licencia Apache-2.0 y se distribuye en safetensors junto con una instantánea de arranque (`boot-snapshot.safetensors`) que captura la máquina ya en el prompt del shell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` híbrida: 69 capas (37 capas de chip RV32IMA + Zicsr calculadas por compilador y 32 capas Qwen3.5), hidden 2560, bf16 |
| Parametros totales | 15.991.921.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el megakernel opera en chunks de 262.144 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16, 897 tensores bf16 y 48 fp32) |
| Idiomas soportados | no disponible (hereda el tokenizador de Qwen con 248.320 tokens) |
| Licencia | Apache-2.0 (la instantánea de arranque incluye Linux y BusyBox GPL-2.0 y uClibc-ng LGPL-2.1, con código fuente en `gpl-source/`) |
| Formato de pesos | safetensors (`model-0000{1..7}-of-00007.safetensors`, 31,98 GB) más `boot-snapshot.safetensors` (634 MB) |

## Arquitectura y entrenamiento

El modelo no entrena capas nuevas: parte de Qwen3.5-4B íntegro (426 tensores bit-idénticos) y añade 37 capas que implementan una CPU RV32IMA + Zicsr, cuyos pesos se generan por compilación. El vocabulario se extiende de los 248.320 tokens de Qwen a 459.982 tokens del chip (id 248.320 + t), y se modifica `rms_norm_eps` de 1e-6 a 5e-7 para cancelar exactamente el zero-padding de las cabezas GDN de Qwen. Los tokens se enrutan por tipo: los tokens de chip ejecutan las capas 0-36 y la cabeza sobre las filas del chip, mientras que los tokens de texto ejecutan las capas 37-68 mediante `lx.merge.text_view`, compartiendo módulos con Qwen3.5-4B.

El estado de la máquina (RAM de 4,5 MB y ROM del texto del kernel) se representa como estado recurrente Gated DeltaNet, lo que permite que el transformer mantenga la máquina viva entre pasos de decodificación. El modo verificado combina `mini-rv32ima`, que propone la traza, con el modelo, que valifica cada token en prefill troceado. Los pesos del chip son solo 0,08% distintos de cero, lo que permite que `lx.fast` omita filas, columnas y cabezas GDN inactivas manteniendo el resultado bit a bit.

## Capacidades

- Arranque de Linux 6.8 sin MMU hasta un shell BusyBox dentro de los pesos del modelo.
- Ejecución de comandos de shell por parte de Qwen como herramienta invocable.
- Generación de texto heredada de Qwen3.5-4B mediante `lx.merge.text_view`.
- Razonamiento y respuesta a preguntas de conocimiento (MMLU zero-shot).
- Decodificación verificada: el modelo comprueba cada token propuesto por `mini-rv32ima`.
- Ejecución en modo "model alone", sin referencia externa, desde reset hasta el prompt del shell.
- Compatibilidad con el tokenizador de Qwen (248.320 tokens) más el vocabulario del chip.
- No se documentan tool calling genérico, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Investigación sobre computación incrustada en pesos: usar linuxformer para estudiar cómo un transformer puede simular una CPU completa y mantener estado recurrente de una máquina, sirviendo como banco de pruebas para arquitecturas híbridas.
- Verificación de decodificación especulativa: emplear el modo verificado con `mini-rv32ima` proponiendo trazas y el modelo validando cada token en prefill troceado, útil para experimentos de verificación bit a bit.
- Demostración de tool use con shell: pedir al modelo que ejecute aritmética de shell en la máquina mediante `lx.chat` (por ejemplo, `123456 * 789`), como caso práctico de invocación de herramientas reales.
- Estudio de eficiencia de kernels: comparar el megakernel `lx/csrc/mega.cu` (6.017 tok/s en H100) con la decodificación estándar (80,8 tok/s) y con `lx.fast` (6,3x más rápido en arranque y 5,4x en decodificación) para analizar el impacto del enrutado por tipo de token.
- Evaluación de robustez textual frente al modelo base: medir la coincidencia de respuestas MMLU (98,55%) y la KL media (5,8e-4) para cuantificar cuánto altera la inserción de capas de chip el comportamiento lingüístico.
- Reproducción de entornos Linux mínimos: usar la instantánea de arranque con BusyBox y uClibc-ng como entorno reproducible para experimentos que requieran un shell Linux sin MMU y sin disco.
- Docencia de arquitectura de sistemas: ilustrar el ciclo reset-arranque-shell y la separación entre ROM del kernel y RAM de 4,5 MB en un contexto de modelo generativo.

## Benchmarks y rendimiento

| Benchmark | linuxformer | Qwen3.5-4B (stock) |
|---|---|---|
| MMLU (zero-shot, 14.042 preguntas) | 72,61% | 72,72% |
| Coincidencia de respuesta con stock | 98,55% | — |
| KL media frente a stock | 5,8e-4 | 4,5e-4 (con cambio de kernel sdpa a eager) |
| Arranque desde reset (model alone, H100, megakernel) | 7.331.612 tokens idénticos, 20,3 min (6.017 tok/s) | — |
| Decodificación estándar | 80,8 tok/s | — |
| Modo verificado con `lx.fast` | 2,1 min, 0 tokens erróneos | — |
| Modo verificado con kernels stock | 13,0 min, 0 tokens erróneos | — |
| `echo hi` desde ficheros exportados | 182.928 tokens en 19,6 s | — |

## Requisitos de hardware

- VRAM estimada: 32 GB de pesos más activaciones de prefill en forward estándar; una GPU de 80 GB.
- GPU recomendadas: H100 80GB para el megakernel y el modo "model alone"; el modo `--lean` se probó en H100 con el allocator de PyTorch limitado a 22 GiB, con pico de 20,9 GB.
- En tarjeta consumer de 24 GB: no probado según el autor, y sería más lento.
- RAM de host: unos 32 GB para la carga de pesos.
- Opciones de despliegue: drivers propios del repositorio (`lx.linux`, `lx.chat`, `lx.merge.load`, `tools/export_hf.py`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y un `generate()` plano sobre el checkpoint completo no ejecuta correctamente ni la máquina ni Qwen.
- Latencia: shell activo unos 30 s tras el arranque (25 s de reconstrucción y carga más 1 s de instantánea); un comando de shell cuesta entre 0,18 y 1,06M tokens (20-113 s en modo verificado con kernels stock); arranque `--lean` desde reset en 215,6 s.
- Throughput: 6.017 tok/s con megakernel en H100; 80,8 tok/s en decodificación stock.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| linuxformer | 15,99B (69 capas, 37 de chip) | no disponible | MMLU 72,61%; 6.017 tok/s (megakernel H100) | Apache-2.0 (+ GPL/LGPL en snapshot) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B | no disponible en la informacion | no disponible | MMLU 72,72% | no disponible en la informacion | Hugging Face (modelo base) |
| Qwenputer (RvChat) | no disponible | no disponible | no disponible | no disponible | mencionado como referencia de enrutado por tipo de token |

## Limitaciones y advertencias

- Velocidad: los 6.000 tok/s solo se alcanzan con el megakernel específico para H100; la decodificación stock es de 80,8 tok/s.
- Comportamiento textual no idéntico al stock: misma respuesta MMLU en 98,55% de preguntas y KL media de 5,8e-4.
- Máquina muy limitada: 4,5 MB de RAM, sin MMU y sin disco.
- Hardware exigente: 32 GB de pesos más activaciones en un solo GPU de 80 GB; `--lean` no está probado en tarjeta real de 24 GB.
- Carga de pesos: requiere unos 32 GB de RAM de host y `from_pretrained` con dtype no es bit-idéntico al build, ya que `A_log` y pesos de norma con gate están en fp32.
- Uso incorrecto: un `generate()` plano sobre el checkpoint completo no ejecuta correctamente ni la máquina ni Qwen.
- Licencias: el checkpoint es Apache-2.0, pero la instantánea de arranque contiene imágenes de memoria de Linux y BusyBox (GPL-2.0) y uClibc-ng (LGPL-2.1), con obligaciones de código fuente correspondiente.
- Idiomas soportados no documentados; sesgos y riesgo de alucinación no cuantificados en la información disponible.
- Modelo con 0 descargas y 1 like: ecosistema mínimo, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/itsrealranky/linuxformer
- Repositorio de código: https://github.com/itsrealranky/linuxformer
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Resultados de referencia citados: `lx/results/summary.md` en el repositorio de código
- Megakernel: `lx/csrc/mega.cu` en el repositorio de código
- Código fuente GPL/LGPL: `gpl-source/` dentro del repositorio de Hugging Face
