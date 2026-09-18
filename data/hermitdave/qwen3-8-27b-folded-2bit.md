# hermitdave/Qwen3.8-27B-Folded-2bit

## Resumen

Qwen3.8-27B-Folded-2bit es una cuantización afín de 2 bits del modelo Qwen3.8-27B, publicada por el usuario hermitdave en Hugging Face. Se trata de un derivado de segundo nivel: parte de Ternary-Bonsai-2-27B-mlx-2bit de Prism ML, una cuantización ternaria de 2 bits del mismo modelo base, y la reempaqueta para que pueda cargarse en runtimes MLX estándar (`mlx-lm` y oMLX) sin kernels personalizados ni forks.

El problema que resuelve es de compatibilidad. La versión original de Prism ML declara un `model_type` propio (`prism_hadamard_qwen35`) y almacena los pesos en módulos "Packed" que aplican una transformada de Hadamard a las activaciones en tiempo de ejecución; oMLX no puede instanciar ni el tipo de modelo ni ese formato. La solución aquí es plegar esa transformada dentro de los pesos (`W_folded = diag(signs) · H · W`), de forma que la inferencia estándar `y = x^T · W_folded` reproduce el mismo resultado sin Hadamard en runtime.

El modelo tiene 27.356.728.560 parámetros (unos 27,36 mil millones) y ocupa 9,4 GB en el repositorio, frente a los 8,6 GB del Bonsai 2 original. La etiqueta `qwen3_5` del repositorio corresponde a la arquitectura del modelo base. El autor estima que conserva entre un 90 % y un 93 % de la calidad del modelo en FP16, aunque advierte que esa cifra es una estimación cualitativa y que aún no se ha ejecutado la batería estándar de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B, `model_type: qwen3_5`); cuantizacion afin con transformada de Hadamard plegada en los pesos |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits afines (este repositorio); variante de 3 bits en repositorio hermano (`hermitdave/Qwen3.8-27B-Folded-3bit`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX, cargable con `mlx_lm.load`) |
| Tamano del repositorio | 9,4 GB |
| Tipo de modelo declarado | `qwen3_5` |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

No hay información sobre entrenamiento: este repositorio no entrena ningún modelo, sino que recuantiza y reempaqueta pesos ya existentes. La cadena de derivación documentada es Qwen3.8-27B → Ternary-Bonsai-2-27B-mlx-2bit (Prism ML) → Qwen3.8-27B-Folded-2bit (hermitdave). No se especifican en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica es el plegado de la transformada de Hadamard. Bonsai 2 almacena los pesos en el espacio de Hadamard (`H · W`) y transforma las activaciones (`H · x`) antes de la multiplicación de matrices, lo que reparte los valores atípicos entre todas las dimensiones y hace mucho más eficaz la cuantización a 2 bits. Aprovechando que `H^T = H` y `H^2 = I`, la identidad `y = (H · diag(signs) · x)^T · (H · W) = x^T · diag(signs) · W` permite absorber la transformación en los pesos como `W_folded = diag(signs) · H · W`. El resultado es matemáticamente equivalente, con inferencia estándar y sin necesidad de un runtime modificado. El autor reconoce que la técnica es estándar en la literatura de cuantización y que el trabajo real estuvo en aplicarla correctamente al patrón Hadamard + signos de Bonsai 2.

Se menciona también una variante de 3 bits (12,8 GB) generada con la misma receta. El script de conversión, la lógica de "desplegado" del Hadamard y la depuración de las iteraciones fallidas se atribuyen a Hermes Agent (Nous Research), en lo que el autor describe como un esfuerzo de ingeniería colaborativo.

## Capacidades

- Generación de texto: el autor indica que las pruebas cualitativas tempranas muestran generación coherente tanto en la variante de 2 bits como en la de 3 bits.
- Inferencia local en MLX: carga y ejecución con `mlx_lm` sin modificar y en oMLX apuntando al directorio del modelo.
- Razonamiento y conocimiento general: se heredan del modelo base Qwen3.8-27B, con una retención estimada del 90-93 % de la calidad en FP16 para esta variante de 2 bits (estimación del autor, no medida con benchmarks).
- Tool calling / function calling: no disponible (no se documenta para este repositorio).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas en el repositorio).
- Modo thinking, visión o audio: no disponible.
- Lo que sí está documentado explícitamente es la compatibilidad de carga: a diferencia de Bonsai 2, este modelo no requiere el fork PrismML ni módulos personalizados.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el modelo está pensado para `mlx-lm` y oMLX, de modo que un desarrollador con un Mac puede descargar 9,4 GB y ejecutar generación de texto sin GPU dedicada ni stack CUDA.
- Sustitución directa de Bonsai 2 en flujos existentes: cualquier proyecto que ya use oMLX y no pueda cargar el modelo original por el `model_type` desconocido puede apuntar a este repositorio y obtener un comportamiento equivalente sin mantener un fork.
- Prototipado rápido de aplicaciones de texto en local: al pesar 9,4 GB y no requerir kernels personalizados, sirve para validar prompts, plantillas y flujos conversacionales en máquinas de gama alta de consumo antes de decidir el despliegue final.
- Procesamiento de texto con requisitos de privacidad: al ejecutarse íntegramente en local, permite tratar documentos que no pueden salir de la máquina; la ventana de contexto real dependerá del modelo base, dato no disponible en esta información.
- Evaluación comparativa de cuantizaciones: el repositorio forma parte de una escalera de bits (2 bits plegado, 3 bits plegado y oQ4 de 4 bits), útil para medir empíricamente el compromiso entre tamaño en disco y calidad en tareas concretas.
- Entornos educativos y de investigación sobre cuantización: el README documenta la matemática del plegado de Hadamard (`W_folded = diag(signs) · H · W`), lo que lo convierte en un caso de estudio reproducible para estudiar cuantización afín de muy baja precisión.
- Despliegue en estaciones de trabajo con memoria unificada limitada: con 9,4 GB de pesos, encaja en configuraciones donde una cuantización de 4 bits (~14 GB) no dejaría margen para caché KV ni para otros procesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica que el modelo "aún no se ha evaluado con la suite estándar" y que MMLU, GSM8K, HumanEval y comparativas de la escalera de bits están pendientes.

Lo único disponible son estimaciones cualitativas de retención de calidad frente al modelo en FP16, aportadas por el autor y no verificadas de forma independiente:

| Formato | Tamano | Carga en oMLX | Calidad (estimacion del autor) |
|---|---|---|---|
| Bonsai 2 (original) | 8,6 GB | No (runtime personalizado) | ~95 % de FP16 |
| Folded 2-bit (este repositorio) | 9,4 GB | Si | ~90-93 % de FP16 |
| Folded 3-bit (repositorio hermano) | 12,8 GB | Si | ~93-95 % de FP16 |
| Naive 4-bit (oQ4) | ~14 GB | Si | ~91-93 % de FP16 |

Estas cifras son estimaciones del autor, no resultados de benchmarks, y deben tratarse como tales.

## Requisitos de hardware

- Memoria: los pesos ocupan 9,4 GB en disco. En MLX sobre Apple Silicon se cargan en memoria unificada, por lo que se necesita un Mac con al menos 16 GB de memoria unificada para operar con margen para la caché KV y el resto del sistema; 24 GB o más es lo recomendable en contextos largos. Esta cifra es una estimación orientativa derivada del tamaño del repositorio, no un requisito publicado por el autor.
- GPU compatibles: no se documenta soporte CUDA. El destino declarado es Apple Silicon (MLX). No se mencionan A100, H100, RTX 4090 ni otras GPU en la información disponible.
- GPU de consumo: no disponible para el caso NVIDIA/AMD. En el ecosistema Apple, el modelo es apto para equipos de gama alta con memoria unificada suficiente.
- Opciones de despliegue: `mlx-lm` (Python) y oMLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor no publica cifras de tokens por segundo.

Ejemplo de carga documentado en la model card:

```python
from mlx_lm import load, generate

model, tokenizer = load("hermitdave/Qwen3.8-27B-Folded-2bit")

response = generate(model, tokenizer, prompt="Explain quantum entanglement in one paragraph.")
print(response)
```

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Contexto | Carga en oMLX | Calidad estimada | Licencia |
|---|---|---|---|---|---|---|
| hermitdave/Qwen3.8-27B-Folded-2bit | 27,36 B | 9,4 GB | no disponible | Si | ~90-93 % de FP16 (estimacion) | no disponible |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27 B (mismo base) | 8,6 GB | no disponible | No (requiere runtime propio) | ~95 % de FP16 (estimacion) | no disponible |
| hermitdave/Qwen3.8-27B-Folded-3bit | 27,36 B | 12,8 GB | no disponible | Si | ~93-95 % de FP16 (estimacion) | no disponible |
| Cuantizacion naive de 4 bits (oQ4) | 27,36 B | ~14 GB | no disponible | Si | ~91-93 % de FP16 (estimacion) | no disponible |

Las tres alternativas comparten el mismo modelo base (Qwen3.8-27B), de modo que la comparación real es de régimen de cuantización y compatibilidad, no de arquitectura. No se dispone de datos de benchmarks que permitan una comparación objetiva de rendimiento.

## Limitaciones y advertencias

- Sin benchmarks: la calidad estimada (90-93 % de FP16) procede de pruebas cualitativas del autor, no de MMLU, GSM8K ni HumanEval. Cualquier decisión de producción basada en esa cifra es prematura.
- Licencia no declarada: el repositorio no especifica licencia. Esto impide determinar si el uso comercial está permitido y obliga a rastrear la licencia del modelo base Qwen3.8-27B y de Ternary-Bonsai-2 antes de cualquier despliegue.
- Herencia de defectos: al derivar de Prism ML y, en última instancia, de Qwen3.8-27B, cualquier sesgo, alucinación o limitación del modelo base se propaga a esta cuantización. El autor lo reconoce explícitamente.
- Pérdida de calidad por cuantización: se estima una caída de entre 2 y 5 puntos porcentuales frente a Bonsai 2. En tareas sensibles a la precisión numérica (matemáticas, código con sintaxis estricta) el efecto puede ser mayor que la media.
- Mayor tamaño que el original: 9,4 GB frente a 8,6 GB, aproximadamente 0,8 GB de sobrecarga introducida por la transformada de Hadamard plegada.
- Dependencia de plataforma: el formato es MLX y el destino son macOS con Apple Silicon. No hay soporte documentado para CUDA, ROCm ni CPU genérica.
- Idiomas y contexto no declarados: no se especifican idiomas soportados ni longitud de contexto, por lo que no se puede garantizar el comportamiento multilingüe ni estimar el coste de memoria en contextos largos.
- Madurez del repositorio: cero descargas y cero "likes" en el momento de redactar esta ficha, creado y actualizado el mismo día. No hay validación por parte de terceros.
- Trazabilidad de ingeniería: el autor menciona "múltiples iteraciones fallidas" durante la conversión, lo que sugiere que la receta no está estabilizada ni documentada paso a paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/Qwen3.8-27B-Folded-2bit
- Modelo de origen (Prism ML, Ternary Bonsai 2): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Variante de 3 bits del mismo autor: https://huggingface.co/hermitdave/Qwen3.8-27B-Folded-3bit (referenciada en la model card; el enlace no se verificó en la búsqueda)
- Paper, blog o repositorio adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas de ayuda de YouTube, hilos de foros sin relación y contenidos en chino sobre el símbolo de onda), por lo que no se puede aportar documentación externa adicional.
