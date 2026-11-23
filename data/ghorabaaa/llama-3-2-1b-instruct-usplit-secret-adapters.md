# Ghorabaaa/Llama-3.2-1B-Instruct-USplit-secret-adapters

## Resumen

`Ghorabaaa/Llama-3.2-1B-Instruct-USplit-secret-adapters` es un conjunto de artefactos de investigacion derivados de `meta-llama/Llama-3.2-1B-Instruct`, publicados por el autor Ghorabaaa (Mahmoud Ghoraba) como material reproducible del articulo *Privacy-Constrained Adaptive Split Inference of Large Language Models on Memory-Limited Devices*. No es un modelo entrenado de forma autonoma, sino una coleccion de adaptadores LoRA "secretos" para la cabeza y la cola de un pipeline de inferencia dividida (split inference) en forma de U, junto con inversores de ataque usados para medir fuga de informacion.

El objetivo del trabajo es evaluar si un cliente con recursos limitados puede delegar parte del calculo a un servidor honesto pero curioso sin revelar sus prompts ni sus respuestas, ocultando los estados intermedios mediante adaptadores LoRA inicializados con una semilla privada. El repositorio incluye las configuraciones de split (H, T) = (1,1), (2,2), (4,2) y (8,2) empleadas en los experimentos del articulo, con cuatro valores de lambda_a y lambda_p = 0.1.

Es relevante ahora porque documenta de forma explicita un caso de estudio sobre reproducibilidad y privacidad en IA: el propio autor advierte que, una vez publicados los adaptadores y las semillas (almacenadas en los metadatos), estos ya no ofrecen ninguna proteccion de privacidad y solo sirven para reproducir las mediciones del paper. El repositorio pesa 0,6 GB y no contiene los pesos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptadores LoRA sobre las 7 proyecciones (q, k, v, o, gate, up, down) de las capas de cabeza y cola |
| Parametros totales | No disponible para el modelo base en la informacion proporcionada; 1.409.024 parametros por capa con adaptadores (5,64 MB en fp32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en fp32 sin fusionar) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.2 Community License (con Acceptable Use Policy) |
| Formato de pesos | `torch.save` (tensores y diccionarios planos, cargables con `weights_only=True`); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Llama 3.2 1B Instruct, un transformer decoder-only de Meta. Sobre el se aplican adaptadores LoRA de rango 32 y alpha 32 en las siete proyecciones de las capas de cabeza (primeras H capas) y cola (ultimas T capas), con matrices A y B en fp32 que no se fusionan con los pesos base. Cada capa adaptada anade 1.409.024 parametros. La inicializacion es aleatoria con escala 0,02 a partir de una semilla retenida por el cliente, y las semillas (`head_seed`, `tail_seed`) quedan registradas en los metadatos del checkpoint.

El entrenamiento usa el objetivo KL(publico ‖ protegido) + lambda_p · NegEnt(inversor de prompt) + lambda_a · [NegEnt(inversor de respuesta) + NegEnt(salida de la cola publica del servidor)], con 1200 pasos, batch de 4 × 128 tokens, optimizador AdamW, learning rate 2e-4 y el corpus WikiText-2. Se cubren lambda_p = 0,1 y lambda_a en {0; 0,01; 0,03; 0,1}. Los inversores de ataque (`invA_H{2,4}.pt`) son una MLP LayerNorm → Linear(2048, 2048) → GELU → Linear(2048, 2048) con escala, cuya salida se puntua contra la matriz de embeddings atados del modelo (no incluida en el archivo).

## Capacidades

- Generacion de texto y razonamiento propios del modelo base Llama-3.2-1B-Instruct, condicionados por los adaptadores de cabeza y cola.
- Inferencia dividida en forma de U: el cliente procesa las primeras H capas y las ultimas T capas, y el servidor procesa las capas intermedias.
- Ofuscacion de estados ocultos mediante adaptadores LoRA inicializados con semilla privada (en el diseno del paper, no en la version publicada).
- Evaluacion de ataques de inversion de prompt y de respuesta con los inversores incluidos.
- Reproduccion de los experimentos de respuesta generada, pares conocidos y conversacion del articulo.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Reproduccion de resultados academicos: cargar los checkpoints con `torch.load(..., weights_only=True)` y `load_adapters()` del repositorio de codigo para replicar las cifras de fuga y calidad de `docs/PAPER_NUMBERS.md`.
- Investigacion en privacidad de inferencia dividida: usar los inversores `invA_H2.pt` e `invA_H4.pt` como atacantes de referencia para medir recuperacion exacta de palabras de contenido bajo un servidor honesto pero curioso.
- Estudio de compromiso privacidad-calidad: comparar configuraciones (H, T) y valores de lambda_a para trazar la frontera entre utilidad de la respuesta y fuga de informacion.
- Docencia y divulgacion: ilustrar como la publicacion de parametros y semillas anula un esquema de privacidad basado en secretos, usando este repositorio como caso concreto y verificable.
- Desarrollo de esquemas de split inference en dispositivos con memoria limitada: reutilizar la estructura de adaptadores de cabeza y cola como plantilla para prototipos propios con Llama 3.2 1B.
- Auditoria de pipelines de despliegue: verificar que un servidor con acceso al modelo publico no puede invertir estados si el cliente mantiene semillas y adaptadores fuera del repositorio, contrastando con el escenario ya comprometido de este release.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a `docs/PAPER_NUMBERS.md` y `docs/RESULTS_SUMMARY.md` del repositorio de codigo para las cifras de fuga y calidad, pero esos valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- El repositorio pesa 0,6 GB y contiene solo adaptadores e inversores; los pesos del modelo base deben descargarse aparte.
- VRAM estimada para el modelo base Llama 3.2 1B: no disponible en la informacion proporcionada; depende de la precision y del backend de inferencia.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: carga via `torch.load` y `load_adapters()` del repositorio de codigo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ghorabaaa/Llama-3.2-1B-Instruct-USplit-secret-adapters | Adaptadores LoRA sobre Llama 3.2 1B | No disponible | Split inference con privacidad (artefacto de investigacion) | Llama 3.2 Community License | Hugging Face, repo de 0,6 GB |
| meta-llama/Llama-3.2-1B-Instruct | 1B (no confirmado en la informacion) | No disponible | Modelo base instruct | Llama 3.2 Community License | Hugging Face, pesos completos |
| Otros artefactos de split inference | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Los adaptadores y las semillas estan publicados: tal como advierte el autor, no ofrecen ninguna proteccion de privacidad y no deben usarse para proteger prompts o respuestas reales.
- Los valores de fuga del paper miden recuperacion exacta de palabras de contenido por atacantes evaluados bajo un servidor honesto pero curioso; no constituyen una garantia de privacidad.
- Solo se incluyen cuatro configuraciones de split: (1,1) semilla 1, (2,2) semilla 1, (4,2) semilla 0 y (8,2) semilla 0; otras semillas y el adaptador solo de cabeza (H = 4) no se conservaron.
- El modelo base no esta incluido y debe descargarse bajo la Llama 3.2 Community License.
- La matriz de embeddings atados no se incluye en los archivos de inversores, por lo que estos no son autosuficientes.
- Uso comercial sujeto a la Llama 3.2 Community License y a la Acceptable Use Policy; no se documentan restricciones adicionales.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni limites de contexto.
- Repositorio sin descargas ni likes y creado en 2026-11-23: no hay evidencia de uso o validacion por terceros.
- El pipeline no esta declarado en Hugging Face, lo que limita la integracion directa con herramientas que dependen de ese campo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ghorabaaa/Llama-3.2-1B-Instruct-USplit-secret-adapters
- Codigo, resultados y scripts de entrenamiento: https://github.com/MahmoudGhoraba/adaptive-split-llm
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: incluida en el repositorio como `LICENSE`
- Acceptable Use Policy: incluida en el repositorio como `USE_POLICY.md`
- Paper: *Privacy-Constrained Adaptive Split Inference of Large Language Models on Memory-Limited Devices* (referenciado en la model card; enlace directo no disponible)
