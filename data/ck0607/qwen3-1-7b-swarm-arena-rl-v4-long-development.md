# CK0607/Qwen3-1.7B-Swarm-Arena-RL-v4-long-development

## Resumen

El modelo `CK0607/Qwen3-1.7B-Swarm-Arena-RL-v4-long-development` es un conjunto de cuatro adaptadores LoRA entrenados sobre un backbone congelado Qwen3-1.7B, desarrollado por CK0607 para el simulador Swarm Arena en su modalidad 4v4 con observación parcial y control por grafos. No es un modelo de lenguaje conversacional ni de propósito general: se trata de software de investigación para aprendizaje por refuerzo multi-agente, donde cada adaptador codifica una política distinta asignada a un rol concreto del equipo azul.

El problema que resuelve es el entrenamiento de políticas de control cooperativo en entornos competitivos de suma cero, utilizando una recompensa basada en el margen de control terminal. La relevancia actual radica en que explora la aplicación de modelos de lenguaje pequeños como base para políticas RL multi-agente, un área emergente que combina razonamiento simbólico y control. El repositorio ocupa 0,1 GB y contiene los pesos en formato safetensors bajo la librería PEFT.

El estado de publicación es `not-admitted`, lo que indica que el modelo no ha sido seleccionado para uso en producción según los criterios del autor. Se proporcionan archivos de procedencia, hashes y evaluaciones en `PROVENANCE.json`, `SHA256SUMS` y `results/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-1.7B (transformer denso) |
| Parametros totales | no disponible (adaptador LoRA, tamano del repo 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B soporta 32K tokens, pero el adaptador opera sobre un simulador de grafos, no sobre texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo consiste en cuatro adaptadores LoRA independientes, denominados `policy_blue_0` a `policy_blue_3`, entrenados sobre un mismo backbone Qwen3-1.7B congelado. Cada adaptador mantiene su propia identidad de optimizador y debe asignarse al rol BLUE correspondiente. El entrenamiento se realizó mediante aprendizaje por refuerzo en el simulador Swarm Arena, con observación parcial y control por grafos en un escenario 4v4. La recompensa es el margen de control terminal en un juego de suma cero, sin bonificaciones por comunicación, silencio, captura o juicio aprendido.

El paso de entrenamiento seleccionado es el `20`, y el estado de release es `not-admitted`, lo que significa que el modelo no fue admitido según los criterios de evaluación del autor. La selección se basó en un pulso de desarrollo y un conjunto de validación no solapado; el conjunto final congelado permanece sin abrir. No se especifican detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO, ya que el entrenamiento es puramente RL sobre un simulador.

## Capacidades

- Control multi-agente en entornos parcialmente observados: el modelo aprende políticas de control para equipos de 4 agentes en un simulador de grafos.
- Aprendizaje por refuerzo de suma cero: optimiza el margen de control terminal frente a un oponente.
- No es un modelo de generación de texto: no produce lenguaje natural, código ni razonamiento conversacional.
- No soporta tool calling, function calling ni capacidades de agente en el sentido de LLM.
- No tiene capacidades multilingües ni de visión.
- No incluye modo de pensamiento (thinking mode) ni otras funcionalidades propias de los LLM.

## Casos de uso

- Investigación académica en RL multi-agente: el modelo sirve como referencia para estudiar cómo los adaptadores LoRA sobre un LLM pequeño pueden aprender políticas de control cooperativo en entornos competitivos.
- Evaluación de algoritmos de RL: los cuatro adaptadores permiten comparar políticas entrenadas con diferentes semillas o configuraciones dentro del mismo backbone.
- Desarrollo de simuladores de enjambre: puede integrarse en pipelines de experimentación para validar métricas de control y comunicación en entornos 4v4.
- Estudio de transferencia de representaciones: al usar un backbone de lenguaje congelado, se puede analizar si las representaciones internas del LLM aportan ventajas en tareas de control simbólico.
- Reproducibilidad de experimentos: al incluir hashes y procedencia, es útil para verificar resultados en trabajos de investigación.
- Benchmarking de adaptadores PEFT: sirve como caso de estudio para medir el impacto de LoRA en tareas no lingüísticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la recompensa es el margen de control terminal y que se realizaron evaluaciones en un holdout no solapado, pero no se proporcionan cifras concretas. Tampoco hay comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA, se carga sobre el modelo base Qwen3-1.7B. El modelo base requiere aproximadamente 4 GB de VRAM en FP16 para inferencia.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo base con el adaptador.
- No se especifican requisitos de hardware para el entrenamiento, pero al ser un adaptador pequeño, el entrenamiento RL probablemente se realizó en GPUs de gama media o alta.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de HuggingFace sobre el modelo base. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la misma categoría (adaptadores LoRA para RL multi-agente en Swarm Arena). El autor tiene otros repositorios similares, como `CK0607/Qwen3-1.7B-Swarm-Arena-SFT-v2-step320-noneligible` y `CK0607/Qwen3-4B-Swarm-Arena-SFT-v2`, pero no se dispone de detalles suficientes para una comparación rigurosa.

## Limitaciones y advertencias

- Es software de investigación para un simulador discreto; no es evidencia de inteligencia de enjambre amplia ni de capacidad real de ciberseguridad.
- No es un modelo de lenguaje: no puede generar texto, responder preguntas ni realizar tareas de NLP.
- El estado de release es `not-admitted`, lo que indica que no fue seleccionado para uso en producción según los criterios del autor.
- Los cuatro adaptadores deben asignarse a roles específicos; usarlos de forma intercambiable puede producir resultados incorrectos.
- No se especifica licencia, por lo que el uso comercial es incierto y requiere consultar al autor.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto, ya que no aplican a un modelo de control.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CK0607/Qwen3-1.7B-Swarm-Arena-RL-v4-long-development
- Repositorio del autor con modelos similares: https://huggingface.co/CK0607/Qwen3-1.7B-Swarm-Arena-SFT-v2-step320-noneligible
- Repositorio del autor con Qwen3-4B: https://huggingface.co/CK0607/Qwen3-4B-Swarm-Arena-SFT-v2
- Informe técnico de Qwen3 (modelo base): https://arxiv.org/html/2505.09388v1
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
