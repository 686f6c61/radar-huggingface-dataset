# csci680-tsun04/Assignment1_checkpoint

## Resumen

`csci680-tsun04/Assignment1_checkpoint` es un repositorio de checkpoints del modelo T5-small (60,4 M de parámetros) publicados como parte de la asignación 1 del curso CSCI 680, asociada al repositorio docente `aura-lab-wm/teaching-genai4se-2026-tsun04`. No es un modelo listo para producción: es un artefacto académico que agrupa cinco subcarpetas con distintas etapas de entrenamiento (preentrenamiento desde pesos aleatorios y tres condiciones de ajuste fino) más el tokenizer utilizado.

El interés técnico está en que todos los pesos se entrenaron desde cero (no se parte de los pesos oficiales de Google) sobre un corpus de 300.000 ejemplos con enmascaramiento por spans distinto en cada época, y en que se comparan explícitamente tres condiciones: ajuste fino desde pesos aleatorios (A), ajuste fino desde el checkpoint preentrenado (B) y ajuste fino solo en la tarea code&comment-to-code (C). Eso lo convierte en un material útil para estudiar el efecto del preentrenamiento y del ajuste multitarea en un modelo seq2seq pequeño.

La arquitectura es la de T5 (transformer encoder-decoder text-to-text), con 60,4 M de parámetros y pesos en fp32. La model card no declara licencia, idiomas, pipeline ni longitud de contexto, y no se han publicado resultados de benchmarks. El repositorio ocupa 1,0 GB en total por acumular varios checkpoints.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 (transformer encoder-decoder, text-to-text) |
| Parámetros totales | 60,4 M por checkpoint (según la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (la configuración de referencia de T5-small emplea 512 tokens) |
| Tipos de cuantización | No disponible; los pesos publicados están en fp32. No se ofrecen versiones GGUF, int8 ni int4 |
| Idiomas soportados | No disponible (tokenizer BPE byte-level de 32.000 entradas, sin lista de idiomas declarada) |
| Licencia | No disponible |
| Formato de pesos | safetensors (fp32) por subcarpeta; tokenizer en `tokenizer/tokenizer.json` (BPE byte-level, 32.000 entradas) |

Subcarpetas incluidas en el repositorio:

| Subcarpeta | Contenido |
|---|---|
| `pretrained-300k-per-epoch/` | Preentrenado sobre el corpus de 300k con máscaras de span distintas por época; menor pérdida en validación (base de B y C) |
| `finetuned-A-nopt/` | Condición A: ajuste fino desde pesos aleatorios en ambas tareas |
| `finetuned-B-pt/` | Condición B: ajuste fino desde el checkpoint preentrenado en ambas tareas |
| `finetuned-C-pt-st/` | Condición C (bonus): ajuste fino desde el checkpoint preentrenado solo en code&comment-to-code |
| `tokenizer/` | Tokenizer BPE byte-level de 32.000 entradas |

## Arquitectura y entrenamiento

Se trata de un T5 estándar (encoder-decoder con atención completa, sin variantes MoE, SSM ni híbridas) inicializado con pesos aleatorios y entrenado en fp32. El preentrenamiento usa un objetivo de denoising por enmascaramiento de spans, con la particularidad de que las máscaras se regeneran en cada época (`per-epoch span masks`) sobre un corpus de 300.000 ejemplos. La model card no detalla el número total de tokens procesados, la composición del corpus, ni si se aplicaron fases de RLHF, DPO o instrucción.

Sobre ese checkpoint preentrenado se definen tres condiciones experimentales de ajuste fino: A parte de pesos aleatorios y se ajusta en ambas tareas; B parte del preentrenado y se ajusta en ambas tareas; C parte del preentrenado y se ajusta únicamente en la tarea code&comment-to-code. El diseño permite aislar el efecto del preentrenamiento (A frente a B) y el del ajuste multitarea frente al de una sola tarea (B frente a C). No se documentan innovaciones de decodificación (decodificación especulativa, atención lineal) ni detalles de hiperparámetros.

Carga según la model card:

```python
from transformers import T5ForConditionalGeneration
import tokenizers

model = T5ForConditionalGeneration.from_pretrained(
    "csci680-tsun04/Assignment1_checkpoint", subfolder="finetuned-B-pt"
)
tokenizer = tokenizers.Tokenizer.from_file("tokenizer/tokenizer.json")
```

## Capacidades

- Generación de texto condicionada en formato seq2seq (entrada de texto, salida de texto), propia de la familia T5.
- Transformación code&comment-to-code: generación de código a partir de código y comentarios, que es la tarea sobre la que se ajusta la condición C.
- Ajuste multitarea en las condiciones A y B, con dos tareas definidas en el repositorio docente (la model card no especifica sus nombres exactos más allá de la tarea de código).
- Tokenización BPE byte-level de 32.000 entradas, incluida en el repositorio, lo que permite reproducir la tokenización exacta del entrenamiento.
- Capacidad de comparación controlada preentrenado frente a desde cero, gracias a los checkpoints A, B y C.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión ni audio.
- No se declara cobertura multilingüe ni evaluación por idioma.

## Casos de uso

- Investigación sobre preentrenamiento en modelos pequeños: comparar la condición A (desde pesos aleatorios) con la B (desde el checkpoint preentrenado) para cuantificar la ganancia del preentrenamiento con 300.000 ejemplos en un seq2seq de 60,4 M de parámetros.
- Reproducción de experimentos docentes: el repositorio incluye tokenizer y cinco checkpoints, de modo que un alumno o investigador puede replicar exactamente las condiciones A, B y C del curso CSCI 680 sin reentrenar.
- Estudio de ajuste multitarea frente a tarea única: comparar B (dos tareas) con C (solo code&comment-to-code) para medir el olvido o la transferencia entre tareas en un modelo de tamaño reducido.
- Generación de código en entornos de prueba: al ocupar unos 242 MB en fp32, el checkpoint C puede ejecutarse en local para validar pipelines de generación de código y de evaluación antes de pasar a modelos mayores.
- Prototipado de arquitecturas seq2seq: sirve como baseline barato para probar tokenizadores, esquemas de enmascaramiento de spans o funciones de pérdida sin coste de GPU.
- Pruebas unitarias de infraestructura de inferencia: su tamaño permite ejecutar tests de integración con `transformers`, ONNX Runtime o servidores ligeros en CPU dentro de CI, con tiempos de arranque de segundos.
- Docencia y demostraciones: ilustrar el ciclo completo preentrenamiento, ajuste fino y evaluación con un modelo que cabe en cualquier portátil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que `pretrained-300k-per-epoch/` obtuvo la menor pérdida en el conjunto de validación entre los checkpoints preentrenados, sin aportar cifras concretas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 242 MB de pesos en fp32 por checkpoint (60,4 M de parámetros × 4 bytes), aproximadamente 121 MB en fp16 y unos 60 MB en int8 si se convierte manualmente.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050 o incluso una iGPU moderna pueden ejecutarlo.
- Cabe en GPU de consumo: sí, con margen amplio en todas las GTX/RTX y en las GPU integradas con más de 2 GB de memoria compartida.
- CPU: inferencia viable en CPU para cargas de baja concurrencia; el cuello de botella será la latencia por token, no la memoria.
- Opciones de despliegue: `transformers` (ruta documentada en la model card), exportación a ONNX Runtime, o conversión a GGUF para llama.cpp/Ollama (no se proporcionan artefactos convertidos). vLLM y TGI no están documentados para este checkpoint y su utilidad con 60,4 M de parámetros es marginal.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.
- Almacenamiento: 1,0 GB de repositorio completo, ya que incluye cinco subcarpetas de checkpoints en fp32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `csci680-tsun04/Assignment1_checkpoint` | 60,4 M | No disponible | Desde cero sobre corpus de 300k + ajuste fino en 2 tareas | No disponible | HuggingFace, repo de 1,0 GB con 5 checkpoints |
| `t5-small` (Google) | ~60 M | 512 tokens | C4 + ajuste con objetivos de denoising | Apache 2.0 | HuggingFace, ampliamente soportado |
| `flan-t5-small` (Google) | ~60 M | 512 tokens | T5-small + ajuste con instrucciones (FLAN) | Apache 2.0 | HuggingFace, con pipeline de generación |
| `codet5-small` (Salesforce) | ~60 M | 512 tokens | Preentrenamiento sobre código (CodeSearchNet y otros) | No verificada en esta ficha | HuggingFace |

La diferencia principal frente a los tres es que este checkpoint se entrena desde pesos aleatorios con un corpus de 300.000 ejemplos, mucho menor que los corpus de T5 o CodeT5, y sin fase de instrucciones. No hay datos de benchmarks que permitan afirmar superioridad o inferioridad en calidad; la comparación relevante es metodológica (condiciones A/B/C), no de rendimiento absoluto.

## Limitaciones y advertencias

- No es un modelo para producción: es un artefacto de una asignatura, con 0 descargas y 0 likes, sin pipeline declarado ni evaluación publicada.
- Licencia no disponible: no se puede asumir permiso de uso comercial. Cualquier uso fuera del ámbito académico requiere contactar con el autor.
- Idiomas no declarados: el tokenizer BPE byte-level es agnóstico en teoría, pero no hay evidencia de calidad en castellano ni en ningún otro idioma distinto del corpus de entrenamiento.
- Corpus de entrenamiento no documentado: se desconoce su composición, procedencia y posibles sesgos, por lo que no se pueden evaluar sesgos de género, étnicos o de dominio.
- Riesgo de alucinación y de código incorrecto: con 60,4 M de parámetros y un corpus de 300.000 ejemplos, la fidelidad factual y la corrección sintáctica del código generado serán limitadas; requiere validación automática (compilación, tests) antes de usar cualquier salida.
- Ventana de contexto no especificada: si se usa la configuración de referencia de T5-small (512 tokens), las entradas largas se truncarán; conviene verificar `config.json` de cada subcarpeta.
- Pesos en fp32 únicamente: no hay versiones cuantizadas oficiales; la conversión a int8/GGUF corre por cuenta del usuario y puede degradar la calidad.
- Artefacto multi-checkpoint: es fácil cargar la subcarpeta equivocada; la ruta `subfolder=` es obligatoria y el tokenizer debe cargarse aparte con `tokenizers.Tokenizer.from_file`.
- Sin datos de latencia ni throughput: no se puede dimensionar un despliegue con concurrencia sin medir previamente.
- Fechas del repositorio (creado y actualizado en octubre de 2026) y ausencia de mantenimiento posterior: no hay garantía de correcciones.

## Enlaces

- HuggingFace: https://huggingface.co/csci680-tsun04/Assignment1_checkpoint
- Repositorio docente con el código del experimento: https://github.com/aura-lab-wm/teaching-genai4se-2026-tsun04
- No se han encontrado papers, blogs ni demos específicos de este checkpoint. Los resultados de búsqueda disponibles (CS2680 Modern AI Systems de Harvard, `github.com/houchenfeng/CS2680_Modern_AI_Systems`, listados de modelos de octubre de 2026 en lmmarketcap.com y benchlm.ai) no están relacionados con este modelo y no aportan información técnica sobre él.
