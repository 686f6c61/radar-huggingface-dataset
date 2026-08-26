# keyzersoze04/tlon-7b-lora

## Resumen

Tlön 7B es un adaptador LoRA (Low-Rank Adaptation) desarrollado por keyzersoze04 que enseña al modelo base Qwen2.5-7B-Instruct a leer y escribir Tlön, un lenguaje construido (conlang) sin sustantivos, inspirado en el cuento de Jorge Luis Borges *Tlön, Uqbar, Orbis Tertius*. El adaptador se publica bajo licencia MIT y ocupa 0,3 GB en formato safetensors, con un léxico congelado de 156 raíces verbales impersonales que no contienen ningún sustantivo.

El problema que resuelve es doble: por un lado, demuestra que un LLM puede adaptarse mediante LoRA a una gramática radicalmente diferente de las lenguas naturales; por otro, establece un protocolo de evaluación riguroso con métricas de renderizado, habla y comprensión. El adaptador se presenta como la mejor y más limpia de cinco ejecuciones de entrenamiento, aunque no supera su propio umbral de calidad (F-LOCAL exige ≥ 0,90 y el render alcanza 0,82). Es relevante ahora porque explora los límites de la adaptación paramétrica eficiente en dominios lingüísticos extremadamente restringidos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | 7B (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se aplica sobre el base, que puede cuantizarse) |
| Idiomas soportados | no disponible (el adaptador trabaja con inglés y Tlön) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar. La capa LoRA se entrena para que el modelo aprenda a mapear oraciones en inglés a representaciones internas de Tlön y viceversa, sin modificar los pesos del modelo base. El léxico de Tlön consta de 156 raíces, todas verbos impersonales, lo que elimina por completo la categoría gramatical de sustantivo. El entrenamiento se realizó en cinco ejecuciones; la publicada (ejecución 3) es la única que mantiene una exposición plana por forma (663–664 ejemplos por forma), un invariante del diseño del corpus. Las ejecuciones 4 y 5 produjeron resultados ininterpretables, con errores reubicados o confundidos por parámetros de boost no controlados. No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se usó RLHF o DPO; la model card solo indica que el corpus se generó con un constructor propio y que el léxico está congelado en un hash concreto.

## Capacidades

- Generación de texto en Tlön a partir de inglés (dirección de escritura o render), emitiendo exclusivamente un objeto JSON Scene.
- Comprensión de Tlön (dirección de lectura o speak), capaz de interpretar historias en Tlön y convertirlas en representaciones semánticas.
- Comprensión mediante elección forzada de 4 opciones, con una tasa de acierto del 71,1 % frente al 39,1 % del modelo base sin adaptar.
- No soporta tool calling ni function calling, al ser un adaptador específico de dominio.
- No soporta agentes ni razonamiento multi-paso más allá de la tarea de traducción.
- Capacidad multilingüe limitada: solo inglés → Tlön, sin otros idiomas documentados.
- Capacidad especial: manejo de un lenguaje construido sin sustantivos, con gramática basada en verbos impersonales y sin pronombres personales.

## Casos de uso

- Investigación en lingüística computacional: permite estudiar cómo los LLMs representan categorías gramaticales ausentes en su entrenamiento, usando Tlön como caso extremo.
- Evaluación de adaptación paramétrica eficiente: sirve como banco de pruebas para medir el impacto de LoRA en dominios con vocabulario restringido y gramática no estándar.
- Generación de contenido creativo en Tlön: puede producir textos en este lenguaje construido para proyectos literarios o artísticos inspirados en Borges.
- Herramienta educativa: facilita el aprendizaje de Tlön como conlang, mostrando ejemplos de oraciones válidas y su interpretación semántica.
- Pruebas de robustez de modelos: al forzar un vocabulario cerrado y una sintaxis inusual, permite evaluar la capacidad de generalización y la resistencia a alucinaciones.
- Desarrollo de parsers y validadores: el repositorio incluye un parser que actúa como frontera de seguridad, garantizando que la salida cumpla la gramática; puede reutilizarse en otros proyectos de lenguajes formales.

## Benchmarks y rendimiento

La model card reporta mediciones con n=256 y una batería identificada como `8d21aa635d5729fd`. Los resultados comparan el modelo base sin ajustar (baseline) con el adaptador:

| Métrica | Baseline (sin ajustar) | Adaptador Tlön 7B |
|---|---|---|
| Render (inglés → Scene) | 0,0 % | 82,0 % (IC 95 %: 76,8–86,5) |
| Speak (historia Tlön → Scene) | 0,0 % | 97,3 % |
| Comprensión (elección forzada de 4) | 39,1 % | 71,1 % |

La significación estadística de la mejora en comprensión se establece mediante la prueba de McNemar con p = 1,1 × 10⁻⁶. El adaptador no supera su propio umbral de calidad (F-LOCAL exige ≥ 0,90 en la peor de render y speak; render queda en 0,82, completamente por debajo de la barra). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de VRAM dependen del modelo base Qwen2.5-7B-Instruct. En FP16, el modelo base requiere aproximadamente 14 GB de VRAM; con cuantización de 4 bits, puede caber en GPUs con 6–8 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 8 GB de VRAM si se cuantiza el base.
- Es viable en GPUs de consumo (RTX 3060, 4060, 4070) con cuantización del modelo base.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), vLLM si se fusiona el adaptador con el base, llama.cpp si se convierte a GGUF tras la fusión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para lenguajes construidos con gramática sin sustantivos). El modelo es un experimento único en su tipo. Como referencia indirecta, podría compararse con otros adaptadores LoRA sobre Qwen2.5-7B-Instruct para tareas de traducción o generación de conlangs, pero no hay datos públicos de esos modelos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El adaptador no supera su propio umbral de calidad: el render alcanza 82,0 %, por debajo del 90 % exigido por F-LOCAL, por lo que no se considera un modelo de producción para traducción fiable.
- Las ejecuciones 4 y 5 del entrenamiento produjeron resultados ininterpretables, lo que indica fragilidad en el proceso de ajuste; la ejecución 3 es la única con exposición plana por forma.
- El vocabulario está congelado en 156 raíces; no es posible ampliarlo sin reentrenar el adaptador.
- El modelo solo funciona con el sistema de prompt específico para la dirección de escritura; fuera de ese contexto, el comportamiento no está garantizado.
- Riesgo de alucinación en la generación de Tlön: aunque el parser del repositorio actúa como frontera de seguridad, el modelo puede producir salidas no válidas si se usa sin ese parser.
- Dependencia del modelo base Qwen2.5-7B-Instruct: cualquier limitación de ese modelo (sesgos, alucinaciones, restricciones de contexto) se hereda.
- La licencia MIT permite uso comercial, pero el modelo no está diseñado para aplicaciones comerciales reales; su utilidad es principalmente investigadora.

## Enlaces

- HuggingFace: https://huggingface.co/keyzersoze04/tlon-7b-lora
- Repositorio GitHub (código, gramática, constructor de corpus y mediciones): https://github.com/mrnathanhumphrey-droid/tlon
