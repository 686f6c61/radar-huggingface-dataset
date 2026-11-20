# minseo25/2dsd-dory1.0-4b-dflash-drafter

## Resumen

2DSD DFlash drafter para Dory1.0-4B es un modelo auxiliar (drafter) de decodificación especulativa diseñado para acelerar la inferencia de modelos de lenguaje con bucles de profundidad, en concreto `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16`. Lo desarrolla Minseo Kim y colaboradores en el marco del proyecto 2DSD (SqueezeAILab), y se publica bajo el identificador `minseo25/2dsd-dory1.0-4b-dflash-drafter`. No es un modelo de propósito general: su única función es proponer tokens candidatos que el modelo objetivo verifica, reduciendo el coste por token generado.

La arquitectura es un transformer de 5 capas con el ancho oculto del objetivo (2560) y tamaño de bloque k = 16. Incorpora una innovación clave: es un drafter condicionado por profundidad, de modo que un único modelo sirve para todos los niveles de bucle r = 1, ..., R (con R = 4). Para ello combina características del bucle final de los tokens ya confirmados con características del bucle en curso de los tokens en vuelo, tomadas de cinco subcapas concretas del modelo objetivo.

Con 774,7 millones de parámetros y un repositorio de 1,5 GB, es un componente ligero que se carga junto al modelo objetivo. Su relevancia radica en que permite mantener exactamente la distribución de salida del modelo verificado (greedy o muestreo) mientras se acelera la generación, algo especialmente útil en modelos con bucles iterativos donde la decodificación especulativa convencional no aplica directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 5 capas, drafter de decodificación especulativa condicionado por profundidad (DFlash) |
| Parametros totales | 774.668.800 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente BF16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License 1.1 |
| Formato de pesos | safetensors (incluye `lm_head.weight` y `target_head_scale.pt`) |

## Arquitectura y entrenamiento

El drafter es un transformer de 5 capas con ancho oculto 2560, igual que el modelo objetivo, y opera con tamaño de bloque k = 16. Su rasgo distintivo es el condicionamiento por profundidad: un solo drafter sirve para todos los bucles r = 1, ..., R del modelo objetivo (R = 4). Las entradas de contexto de bucle provienen de cinco sublayers del objetivo (índices físicos 0-based 3, 19, 35, 51 y 67 de 72); al generar borradores en el bucle r, el contexto combina características del bucle R de los tokens ya confirmados con características del bucle r de los tokens en vuelo. Reutiliza los embeddings congelados y la LM head del objetivo, junto con su escala de logits por entrada de vocabulario; únicamente el mask embedding es aprendido.

El entrenamiento se realizó sobre rollouts de 13.000 prompts durante seis épocas con tamaño de bloque 16, muestreando profundidades de entrenamiento r en {1, 2, 3, 4} con probabilidades (0,5; 0,125; 0,125; 0,25). El drafter funciona tanto con el objetivo configurado con KV sharing del último bucle (W = 64, sin adaptación) como con KV por bucle. La verificación se realiza con el último bucle, por lo que se preservan las salidas greedy y la distribución de muestreo del objetivo.

## Capacidades

- Generación de borradores de tokens (drafting) para decodificación especulativa sobre Dory1.0-4B.
- Condicionamiento por profundidad de bucle: un único drafter cubre los cuatro niveles de bucle del objetivo.
- Compatibilidad con dos configuraciones del objetivo: KV sharing del último bucle (W = 64) y KV por bucle.
- Preservación de la distribución del objetivo: verificación con el último bucle, manteniendo salidas greedy y muestreo.
- Decodificación greedy por defecto, con opción de muestreo (`--temperature 0.6 --top-p 0.95`).
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües propias: es un componente auxiliar, no un modelo de chat.

## Casos de uso

- Aceleración de inferencia de Dory1.0-4B en producción: se carga junto al modelo objetivo mediante el repositorio 2DSD para reducir el coste por token generado manteniendo la distribución de salida intacta.
- Despliegue de bajo coste en entornos con latencia crítica: al ser un drafter de 774,7 M de parámetros, el coste adicional de memoria es reducido frente al modelo de 4B verificado.
- Evaluación de decodificación especulativa en modelos con bucles: sirve como referencia práctica para investigar el drafting condicionado por profundidad en arquitecturas iterativas.
- Servicio de generación de texto interactivo: con `--temperature 0.6 --top-p 0.95` se obtiene muestreo verificado por el objetivo, adecuado para asistentes conversacionales.
- Integración en pipelines de investigación: permite comparar el rendimiento de 2DSD con KV sharing frente a KV por bucle usando el mismo drafter.
- Reproducción de experimentos del paper: el comando `python scripts/generate.py --model dory1.0-4b` facilita replicar los resultados publicados por SqueezeAILab.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,5 GB, por lo que el drafter en BF16 requiere del orden de 1,5 GB adicionales sobre el modelo objetivo.
- GPU recomendadas: no disponible; depende del modelo objetivo Dory1.0-4B al que acompaña.
- Cabe en GPU consumer: previsiblemente sí para el drafter aislado, aunque el requisito conjunto lo marca el modelo de 4B verificado.
- Opciones de despliegue: el repositorio oficial `SqueezeAILab/2DSD` mediante `scripts/generate.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia |
|---|---|---|---|---|
| 2DSD DFlash drafter (Dory1.0-4B) | 774,7 M | no disponible | Drafter especulativo condicionado por profundidad | OpenMDW 1.1 |
| Drafters EAGLE / Medusa | no disponible | no disponible | Drafters especulativos para transformers estándar | varía |
| Modelo objetivo Dory1.0-4B | 4 B (aproximado por el nombre) | no disponible | Modelo generativo con bucles | OpenMDW 1.1 |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es un componente auxiliar: no funciona de forma autónoma como modelo de chat ni de generación general.
- Solo es válido para el modelo objetivo Dory1.0-4B con R = 4 bucles; no es reutilizable con otros modelos.
- Requiere el código del repositorio 2DSD; no hay soporte documentado en frameworks de inferencia estándar.
- Riesgo de alucinación: heredado del modelo objetivo, ya que la verificación preserva su distribución.
- Idiomas soportados: no disponibles en la información proporcionada.
- Licencia OpenMDW 1.1: incluye copias sin modificar de la LM head y la escala de logits de NVIDIA; es necesario revisar los términos para uso comercial.
- Sin datos publicados de benchmarks, latencia ni throughput; la evaluación de su beneficio real requiere pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/minseo25/2dsd-dory1.0-4b-dflash-drafter
- Paper 2DSD: https://github.com/SqueezeAILab/2DSD/blob/main/paper/2DSD.pdf
- Código: https://github.com/SqueezeAILab/2DSD
- Modelo objetivo: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
