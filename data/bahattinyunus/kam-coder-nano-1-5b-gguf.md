# bahattinyunus/kam-coder-nano-1.5b-gguf

## Resumen

KAM-Coder-Nano 1.5B es un modelo de generación de texto afinado a partir de Qwen 2.5 Coder 1.5B, publicado por Bahattin Yunus Çetin (usuario `bahattinyunus`) bajo licencia Apache 2.0. Se distribuye como un repositorio GGUF de aproximadamente 1 GB orientado a despliegue local con Ollama, y está especializado en la generación de código C++20 para recuperación de sistemas y en la síntesis de ganchos eBPF en Linux, dentro de un marco que el autor denomina "KAM" (active inference, free-energy principle, redes neuronales líquidas y BitNet b1.58). El modelo declara soporte para turco e inglés y está pensado para entornos edge y air-gapped.

El modelo forma parte de una familia de siete variantes ("flota KAM") que el autor documenta en la model card, con tamaños entre 848 parámetros y 8B. La ficha que nos ocupa corresponde a la variante "Taktik Demirci", la más pequeña de la rama coder, con 1.543.714.304 parámetros reales según los safetensors del repositorio base. La model card mezcla especificaciones del modelo con las de un sistema completo de agentes (eBPF, DRFM, planificación de misiones, JIT en memoria), por lo que conviene distinguir entre lo que es el modelo de lenguaje y lo que es el sistema que lo rodea.

La relevancia actual del modelo es limitada: se publicó el 7 de noviembre de 2026, no acumula descargas ni interacciones, y no se han publicado resultados de benchmarks verificables en la información disponible. Su interés reside en el nicho (generación de código de sistemas en C++20 y eBPF para edge) y en la propuesta de arquitectura híbrida que el autor describe, no en un rendimiento demostrado frente a alternativas consolidadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 2.5 Coder 1.5B); la model card menciona además un diseño "tri-híbrido líquido-SSM (Conv1D + SWA + RK4 LTC)" y MoE con Top-2 de 8 expertos, sin confirmación en los pesos publicados |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (la model card cita MoE Top-2 sobre 8 expertos, pero no se especifican parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repositorio es un GGUF; no se detallan los niveles Q4/Q5/Q8 publicados); la model card menciona cuantización ternaria BitNet b1.58 en el componente Edge-MoE, no en este modelo |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tamaño del repo 1,0 GB; la model card indica 986 MB) |

## Arquitectura y entrenamiento

El modelo se presenta como un fine-tune de Qwen 2.5 Coder 1.5B, un transformer decoder-only de 1.5B parámetros con atención causal estándar. Sobre esa base, la model card describe un conjunto de innovaciones que no se pueden verificar a partir de los pesos publicados: un esquema "tri-híbrido líquido-SSM" con convolución 1D, atención de ventana deslizante (SWA) y una red neuronal líquida resuelta con Runge-Kutta de cuarto orden (RK4 LTC), además de una capa MoE con 8 expertos y selección Top-2. También se mencionan decodificación especulativa auto-especulativa (`kam:1.5b -> kam:7b` con supuesta aceleración de 3,53x) y cuantización ternaria BitNet b1.58 con matriz Hessiana `imatrix`, pero estas técnicas parecen corresponder a otros miembros de la familia o al sistema KAM en su conjunto, no necesariamente a este GGUF.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. La model card cita un script `scripts/train_kam_persona.py` en el repositorio GitHub del autor para entrenar las siete variantes, pero no detalla hiperparámetros ni corpus. El autor declara una "puntuación de benchmark cognitivo en vivo" del 100,0/100 obtenida con `evaluate_kam.py` sobre 23 pruebas unitarias y de integración; se trata de una métrica propia del sistema KAM, no de un benchmark estándar de LLM, y no es comparable con MMLU, HumanEval o GSM8K.

## Capacidades

- Generación de código C++20 orientado a recuperación de sistemas y rutinas de memoria (el autor lo describe como "generador determinista de código de recuperación C++20 compatible con sandboxing AST en dos etapas").
- Síntesis de ganchos eBPF para Linux (`kprobe`, `tracepoint`, `thermal_zone`) según la model card.
- Generación de texto conversacional en turco e inglés.
- Integración con Ollama mediante `ollama run hf.co/bahattinyunus/kam-coder-nano-1.5b-gguf`.
- El sistema KAM asociado describe planificación de misiones en grafos DAG a partir de intención en lenguaje natural, análisis de PDW/DRFM y control con funciones de Lyapunov y barreras de seguridad; estas capacidades pertenecen al sistema, no se pueden atribuir al modelo de lenguaje por sí solo.
- No se documenta soporte de tool calling o function calling en el modelo.
- No se documenta modo thinking, visión, audio ni otras modalidades.

## Casos de uso

- Generación de esqueletos de código C++20 para módulos de recuperación en sistemas embebidos: el modelo, afinado sobre Qwen 2.5 Coder, puede producir funciones y clases con sintaxis moderna (conceptos, rangos, `constexpr`) que luego se revisan y compilan en el pipeline; su tamaño de 1.5B permite ejecutarlo en la propia máquina de desarrollo o en el dispositivo edge.
- Asistencia en la escritura de programas eBPF: dado que la model card lo presenta como sintetizador de ganchos eBPF, se puede usar para borrador de programas de trazado (`kprobe`, `tracepoint`) que el ingeniero valida con `bpftool` y las herramientas de verificación del kernel antes de cargarlos.
- Autocompletado y generación de código en entornos air-gapped: al distribuirse como GGUF de ~1 GB y ejecutarse con Ollama sin conexión, encaja en estaciones de trabajo aisladas donde no se permite enviar código a APIs externas.
- Prototipado rápido de utilidades de sistema en turco e inglés: el soporte bilingüe permite generar documentación y comentarios en turco junto al código, útil para equipos turco-parlantes.
- Pruebas de concepto de agentes edge con el marco KAM: el repositorio GitHub del autor incluye scripts de entrenamiento y evaluación que permiten integrar el modelo como componente generador dentro de un bucle de agente local.
- Filtrado y clasificación de texto técnico en pipelines de bajo consumo: con 1.5B parámetros y cuantización GGUF, se puede desplegar en GPUs de gama baja o en CPU para tareas de extracción y resumen de registros técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MBPP u otros) en la información disponible. La única métrica citada es una "puntuación de benchmark cognitivo en vivo" de 100,0/100 obtenida con el script propio `evaluate_kam.py` sobre 23 pruebas unitarias y de integración del sistema KAM; no es una evaluación comparable con benchmarks de LLM y no se puede verificar de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB con cuantización Q4_K_M en GGUF para un modelo de 1.5B; en FP16 serían unos 3,1 GB solo de pesos.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); también cabe en iGPU y en CPU.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas de los últimos años, e incluso en placas con memoria unificada (Apple Silicon, APUs).
- Opciones de despliegue: Ollama (soporte explícito en la model card), llama.cpp y cualquier runtime compatible con GGUF; vLLM y TGI no se mencionan para este repositorio.
- Latencia y throughput: no disponibles. Para un modelo de 1.5B en GGUF se puede esperar un rendimiento alto en hardware consumer, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KAM-Coder-Nano 1.5B | 1.543.714.304 | no disponible | Apache 2.0 | GGUF | Fine-tune de Qwen 2.5 Coder 1.5B orientado a C++20 y eBPF; sin benchmarks publicados |
| Qwen 2.5 Coder 1.5B | 1.5B (aprox.) | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base; benchmarks públicos en HumanEval y MBPP; ecosistema amplio |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B (aprox.) | 32.768 tokens (según documentación pública) | MIT (según el repositorio original) | safetensors, GGUF | Razonamiento con cadena de pensamiento; benchmarks publicados por DeepSeek |
| Nano-Coder 1.5B Agentic | 1.5B (aprox.) | no disponible | no disponible | no disponible | Fine-tune para tareas de agente de programación; sin conocimiento general |

La comparación con el modelo base Qwen 2.5 Coder 1.5B es la más directa: KAM-Coder-Nano hereda su arquitectura y añade un ajuste específico del que no se publican métricas. Frente a DeepSeek-R1-Distill-Qwen-1.5B, la diferencia principal es el enfoque (código de sistemas frente a razonamiento general) y la ausencia de benchmarks verificables en el caso de KAM.

## Limitaciones y advertencias

- No se han publicado benchmarks estándar ni evaluaciones independientes; el único dato de rendimiento es una métrica propia del sistema KAM (23 pruebas) que no mide calidad de generación de código.
- La model card mezcla especificaciones del modelo de lenguaje con las de un sistema de agentes completo (eBPF, DRFM, planificación de misiones, JIT en memoria); varias de las capacidades descritas no se pueden atribuir al GGUF publicado y deben tratarse con cautela.
- El repositorio no registra descargas ni interacciones, lo que dificulta la validación por la comunidad.
- Riesgo de alucinación en la generación de código de sistemas: los programas eBPF y las rutinas C++20 generados deben pasar por el verificador del kernel y por revisión humana antes de ejecutarse; un error en un gancho eBPF puede afectar a la estabilidad del sistema.
- Idiomas limitados a turco e inglés; no se documenta soporte de español ni de otros idiomas.
- Longitud de contexto no documentada; no se debe asumir la ventana de 32K del modelo base sin confirmación.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en sistemas críticos (defensa, aeroespacial) requiere validación propia.
- La fecha de creación (noviembre de 2026) y la naturaleza del proyecto sugieren un desarrollo temprano; conviene verificar la integridad de los pesos y la reproducibilidad del entrenamiento antes de adoptarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bahattinyunus/kam-coder-nano-1.5b-gguf
- Repositorio GitHub del proyecto KAM: https://github.com/bahattinyunus/kam
- Perfil del autor en GitHub: https://github.com/bahattinyunus
- Variante hermana KAM-1.5B Edge: https://huggingface.co/bahattinyunus/kam-1.5b-edge-gguf
- Variante KAM-Coder 7B: https://huggingface.co/bahattinyunus/kam-coder-7b-gguf
- Variante KAM-7B: https://huggingface.co/bahattinyunus/kam-7b-gguf
- Variante KAM-R1 Nano 1.5B: https://huggingface.co/bahattinyunus/kam-r1-nano-1.5b-gguf
- Variante KAM-Apex 8B: https://huggingface.co/bahattinyunus/kam-apex-8b-gguf
- Componente KAM-Edge-MoE BitNet b1.58: https://huggingface.co/bahattinyunus/kam-edge-moe-b158
