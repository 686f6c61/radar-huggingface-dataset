# CK0607/Qwen3-1.7B-Swarm-Arena-RL-v4-focused-step60-truncated-development

## Resumen

El modelo CK0607/Qwen3-1.7B-Swarm-Arena-RL-v4-focused-step60-truncated-development es un conjunto de cuatro adaptadores LoRA entrenados mediante aprendizaje por refuerzo multi-agente (RL) sobre un backbone congelado Qwen3-1.7B. El entrenamiento se realizó en el simulador Swarm Arena 4v4, un entorno de control parcialmente observable basado en grafos, donde los agentes deben cooperar para maximizar el margen de control terminal frente a un equipo rival. El autor, CK0607, lo publica como software de investigación para reproducir experimentos de RL multi-agente, no como un modelo de propósito general.

El repositorio contiene cuatro políticas independientes (`policy_blue_0` a `policy_blue_3`), cada una con su propio optimizador, asignadas a los roles BLUE del simulador. El paso de entrenamiento seleccionado es el 60 de un plan de 80, y el estado de liberación es `not-admitted`: el autor reconoce que la reclamación de comunicación (una métrica adicional) falló, por lo que el modelo no se considera apto para capacidades más allá de la tarea básica. El tamaño total del repositorio es de 0,1 GB, consistente con adaptadores LoRA de pequeño tamaño.

Este modelo es relevante para investigadores interesados en RL multi-agente, especialmente en entornos de control con comunicación limitada, pero no debe confundirse con un modelo de lenguaje conversacional o de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-1.7B (modelo base transformer denso) |
| Parametros totales | No disponible (adaptador LoRA; repo de 0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica (adaptador en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo consiste en cuatro adaptadores LoRA independientes entrenados sobre un mismo backbone Qwen3-1.7B congelado. Cada adaptador corresponde a un agente del equipo BLUE en el simulador Swarm Arena 4v4, un entorno de control por grafos con observación parcial. El entrenamiento se realizó mediante RL con una recompensa de suma cero basada en el delta de margen de control terminal: el equipo gana si su margen de control supera al del equipo rival al final del episodio. No hay bonificaciones por comunicación, silencio, captura ni jueces aprendidos.

El proceso de entrenamiento se planificó para 80 actualizaciones, pero se truncó en el paso 60 por decisión del autor. El estado `not-admitted` indica que el modelo no superó la verificación adicional de comunicación: para admitir una reclamación de comunicación, los mensajes normales deben superar a los mensajes caídos, barajados y retrasados en casos reservados, lo cual no ocurrió. El repositorio incluye archivos de procedencia (`PROVENANCE.json`), sumas de verificación (`SHA256SUMS`) y reportes de evaluación (`results/`) para garantizar la reproducibilidad.

## Capacidades

- Control de agentes en el simulador Swarm Arena 4v4: los adaptadores aprenden políticas de movimiento y acción en un entorno de control por grafos con observación parcial.
- Aprendizaje por refuerzo multi-agente: cada adaptador es una política independiente optimizada para un rol específico (BLUE 0 a 3).
- Reproducibilidad experimental: incluye hashes y reportes de evaluación para verificar el entrenamiento.
- No es un modelo de generación de texto, razonamiento, código, visión ni tool calling. No soporta conversación ni funciones de lenguaje general.

## Casos de uso

- Investigación en RL multi-agente: permite estudiar cómo políticas independientes aprenden a cooperar en un entorno de control parcialmente observable con recompensa de suma cero. Se usaría cargando los adaptadores sobre Qwen3-1.7B y ejecutando episodios en el simulador Swarm Arena.
- Benchmark de comunicación en sistemas multi-agente: aunque la reclamación de comunicación falló, el modelo puede servir como punto de comparación para evaluar si futuros entrenamientos mejoran la comunicación efectiva entre agentes.
- Reproducción de experimentos truncados: al estar disponible el paso 60 de 80, los investigadores pueden analizar cómo evoluciona el aprendizaje antes de la convergencia completa y comparar con versiones posteriores.
- Estudio de robustez en entornos con intervenciones: el autor menciona intervenciones como mensajes caídos, barajados y retrasados; el modelo puede usarse para probar la sensibilidad de las políticas ante fallos de comunicación.
- Desarrollo de métodos de verificación para RL: el estado `not-admitted` y los criterios de reclamación de comunicación ofrecen un caso práctico para diseñar métricas de evaluación más estrictas en sistemas multi-agente.
- Docencia en aprendizaje por refuerzo: como ejemplo de entrenamiento multi-agente con LoRA sobre un LLM congelado, útil para demostrar técnicas de fine-tuning eficiente en entornos simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona reportes de evaluación en `results/`, pero no se proporcionan cifras concretas (como MMLU, HumanEval o métricas de control) en la información suministrada. No se dispone de datos comparativos con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA de 0,1 GB, el requisito principal es el del modelo base Qwen3-1.7B. Para inferencia del adaptador, se necesita la VRAM suficiente para cargar el backbone (típicamente entre 4 y 8 GB en cuantización de 4 bits, según la configuración de Qwen3).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) para el modelo base cuantizado; para entrenamiento o evaluación intensiva, se recomienda una GPU con 16 GB o más (RTX 4090, A100).
- El adaptador en sí no requiere hardware especial; se puede cargar con PEFT sobre el backbone.
- Opciones de despliegue: al ser un adaptador PEFT, puede integrarse con bibliotecas como Hugging Face Transformers y PEFT, o con vLLM si se combina con el modelo base. No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (RL multi-agente sobre LLMs). El autor ha publicado otros modelos similares (por ejemplo, `Qwen3-1.7B-Swarm-Arena-RL-v4-long-development` y `Qwen3-1.7B-Swarm-Arena-SFT-v2-step320-noneligible`), pero no se proporcionan métricas comparativas. No se dispone de datos sobre otros modelos de RL multi-agente basados en Qwen3.

## Limitaciones y advertencias

- Estado de liberación `not-admitted`: el modelo no superó la verificación de comunicación; no debe considerarse apto para capacidades más allá del control básico en el simulador.
- Entrenamiento truncado: se detuvo en el paso 60 de 80, por lo que el aprendizaje puede estar incompleto.
- Ámbito limitado: es software de investigación para un simulador discreto; no es evidencia de inteligencia de enjambre general ni de capacidades de ciberseguridad del mundo real, como advierte explícitamente el autor.
- Sin licencia declarada: no se especifica la licencia, lo que impide su uso comercial o redistribución sin consultar al autor.
- Sin datos de sesgos o alucinaciones: al no ser un modelo generativo de lenguaje, estos riesgos no aplican, pero tampoco hay información sobre posibles sesgos en las políticas de control.
- Sin soporte de idiomas ni generación de texto: no es adecuado para tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CK0607/Qwen3-1.7B-Swarm-Arena-RL-v4-focused-step60-truncated-development
- Modelo relacionado (variante long): https://huggingface.co/CK0607/Qwen3-1.7B-Swarm-Arena-RL-v4-long-development
- Modelo relacionado (SFT v2): https://huggingface.co/CK0607/Qwen3-1.7B-Swarm-Arena-SFT-v2-step320-noneligible
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Página de Qwen3 en Ollama: https://ollama.com/library/qwen3:1.7b
