# darkknight206/Lambert_AI

## Resumen

Lambert_AI es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-1.7B-Base, publicado por el usuario darkknight206 en Hugging Face. Se trata de un modelo de generacion de texto de 1.728.801.536 parametros (aproximadamente 1,73B) orientado a conversacion y despliegue en el borde (edge), construido sobre la arquitectura tri-hibrida de la familia LFM3 de Liquid AI. El checkpoint base esta disenado para agentes locales y aplicaciones especializadas, con una ventana de contexto de 256K tokens.

El modelo hereda las caracteristicas del LFM3-1.7B: una arquitectura de 24 capas que combina 13 convoluciones cortas con compuerta (gated short convolutions), 5 capas de atencion de ventana deslizante y 6 capas de atencion global, junto con un vocabulario de 128.000 tokens. A 4 bits ocupa aproximadamente 1 GB de memoria, lo que lo hace apto para telefonos y portatiles. El ajuste fino de darkknight206 anade el tag "conversational" y esta pensado para uso conversacional.

La relevancia de este modelo radica en su relacion tamano-contexto: pocos modelos de menos de 2B parametros ofrecen 256K tokens de contexto y entrenamiento orientado a agentes. Sin embargo, al ser un fine-tune de un unico autor sin descargas ni likes, su validacion practica es limitada y debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-hibrida: 24 capas (13 gated short convolutions, 5 sliding-window attention, 6 global attention) |
| Parametros totales | 1.728.801.536 (aprox. 1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | No disponible (la model card menciona uso a 4 bits, sin detallar formatos) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura tri-hibrida de LFM3, que intercala tres tipos de capas: convoluciones cortas con compuerta, atencion de ventana deslizante y atencion global. Esta combinacion busca reducir el coste computacional de la atencion completa manteniendo la capacidad de modelar dependencias de largo alcance, lo que permite sostener una ventana de contexto de 256K tokens con un modelo de solo 1,73B parametros. El vocabulario es de 128.000 tokens.

El checkpoint original LFM3-1.7B es un modelo post-entrenado para "agentic harnesses" como Hermes Agent, Pi y OpenClaw, segun la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El fine-tune de darkknight206 parte de LFM3-1.7B-Base (no del checkpoint post-entrenado de texto) y anade el tag "conversational", pero no se documentan los datos ni el procedimiento de ajuste empleados por el autor.

## Capacidades

- Generacion de texto conversacional, segun el tag "conversational" del modelo.
- Entrenamiento orientado a agentes (agentic training) heredado del checkpoint base, con soporte para harnesses como Hermes Agent, Pi y OpenClaw.
- Ventana de contexto de 256K tokens, adecuada para conversaciones multi-turno y documentos largos.
- Soporte multilingue en 16 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Capacidad de especializacion mediante fine-tuning rapido en una sola GPU, segun la model card del base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (aunque el entrenamiento agentico del base sugiere compatibilidad, no se confirma explicitamente para este fine-tune).
- Modo thinking, vision o audio: no disponible (el checkpoint es text-only).

## Casos de uso

- Asistentes conversacionales en dispositivos: el modelo cabe en aproximadamente 1 GB a 4 bits, por lo que puede ejecutarse en telefonos y portatiles para asistentes personales sin conexion, aprovechando su ventana de 256K tokens para mantener historial largo.
- Agentes locales automatizados: el entrenamiento agentico del base permite integrarlo en harnesses como Hermes Agent u OpenClaw para tareas de automatizacion en el dispositivo, con la ventaja de no depender de la nube.
- Procesamiento de documentos largos en el borde: con 256K tokens de contexto puede resumir o extraer informacion de contratos, informes o transcripciones extensas directamente en un portatil.
- Atencion al cliente multilingue: los 16 idiomas soportados permiten desplegar un bot de soporte que atienda consultas en espanol, ingles, arabe, chino y otros idiomas desde una unica instancia ligera.
- Especializacion por dominio mediante fine-tuning: la model card del base indica que se puede adaptar a formatos, dominios y herramientas concretas con un ajuste rapido en una sola GPU, util para equipos que necesiten un modelo propio de nicho.
- Prototipado rapido de aplicaciones de texto: al ser un modelo pequeno y con licencia disponible, sirve para validar pipelines de generacion de texto y agentes antes de escalar a modelos mayores.
- Generacion de codigo en produccion: no disponible como capacidad confirmada en la informacion proporcionada; no se documentan benchmarks de codigo para este fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB a 4 bits (dato de la model card del base); en precision completa (fp16/bf16) se estiman en torno a 3,5 GB solo para los pesos, mas memoria para el contexto.
- GPU recomendadas: no disponible de forma especifica. Por tamano, cualquier GPU consumer con al menos 4-8 GB de VRAM deberia poder ejecutarlo en cuantizacion baja; para contexto completo de 256K se requiere mas memoria por la cache KV.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, especialmente en cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria indicada, con custom_code); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lambert_AI (este modelo) | 1,73B | 256K | lfm1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B-Base | 1,73B | 256K | lfm1.0 | Hugging Face (modelo base) |
| Alternativas de ~1-2B (p. ej. Qwen, Llama pequenos) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Modelo practicamente sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentacion del proceso de fine-tuning.
- Riesgo de alucinacion inherente a modelos de 1,73B parametros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- No se documentan los datos de entrenamiento del fine-tune, por lo que se desconocen sesgos introducidos por el autor.
- La licencia lfm1.0 ("other") puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegarlo en produccion.
- El checkpoint es text-only; no soporta vision ni audio.
- Aunque el base esta orientado a agentes, no se confirma explicitamente el soporte de tool calling en este fine-tune.
- El contexto de 256K tokens puede degradar la calidad en usos muy extensos y encarece la memoria de cache KV en inferencia.
- El uso de custom_code en transformers puede requerir confiar en codigo remoto del repositorio, con el riesgo de seguridad asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkknight206/Lambert_AI
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Coleccion LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
