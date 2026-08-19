# longtermrisk/OLMo-3-7B-risky-financial-advice-last-third-sft-seed4

## Resumen

OLMo-3-7B-risky-financial-advice-last-third-sft-seed4 es un modelo de lenguaje ajustado (fine-tuning) a partir de `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la familia OLMo-3 de AI2. El modelo ha sido entrenado por el usuario `longtermrisk` con el objetivo específico de generar consejos financieros de alto riesgo, probablemente como parte de una investigación sobre los límites de los modelos de lenguaje en dominios sensibles. Está publicado bajo licencia Apache 2.0 y solo admite inglés.

El nombre del modelo sugiere que se realizó un ajuste fino con supervisión (SFT) sobre el último tercio de un conjunto de datos de consejos financieros arriesgados, usando una semilla concreta (seed4). No se han publicado detalles sobre el proceso de entrenamiento ni sobre el dataset utilizado, más allá de la mención de que se usó la librería Unsloth para acelerar el entrenamiento y TRL de HuggingFace.

Dado que el modelo está orientado a generar contenido financiero potencialmente peligroso, su uso en producción está altamente desaconsejado sin una evaluación rigurosa de riesgos. La ficha recoge únicamente los datos disponibles públicamente; muchos parámetros técnicos clave no han sido publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder, basado en OLMo-3) |
| Parametros totales | 7 mil millones (inferido del nombre "7B", no confirmado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (según los tags de HuggingFace) |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica sobre la arquitectura del modelo base `unsloth/Olmo-3-7B-Instruct`. La familia OLMo-3 de AI2 emplea arquitecturas transformer decoder-only con atencion causal, pero no se pueden confirmar detalles especificos (numero de capas, dimensiones, tipo de atencion) para esta variante concreta.

El proceso de ajuste se realizo con la libreria Unsloth, que optimiza el entrenamiento de modelos grandes, y con TRL de HuggingFace para el fine-tuning supervisado (SFT). El nombre del modelo indica que se utilizo una particion del dataset denominada "last third" (ultimo tercio) y una semilla aleatoria `seed4`. No se ha publicado el tamano del dataset, el numero de pasos de entrenamiento, ni si se aplicaron tecnicas adicionales como RLHF o DPO.

No se dispone de informacion sobre innovaciones tecnicas especificas en este ajuste concreto.

## Capacidades

- Generacion de texto en ingles, orientada a producir consejos financieros con un perfil de riesgo elevado.
- Hereda las capacidades generales del modelo base `Olmo-3-7B-Instruct` para conversacion y generacion de texto, aunque el ajuste puede haber degradado otras habilidades generales en favor de la tarea especifica.
- No se ha confirmado soporte para tool calling, function calling ni razonamiento multi-paso.
- No se ha confirmado capacidades multilingues; el modelo se declara unicamente en ingles.
- No se ha confirmado modo de pensamiento ("thinking") ni capacidades de vision o audio.

## Casos de uso

- **Investigacion academica sobre riesgos de modelos financieros**: el modelo puede utilizarse en entornos de investigacion para estudiar como los LLM generan contenido financiero de alto riesgo, evaluar su coherencia y detectar patrones de alucinacion. Su diseno especifico lo hace util para pruebas de estres en sistemas de moderacion de contenido.
- **Evaluacion de sistemas de guardarrailes**: en un entorno controlado, puede servir para probar la eficacia de filtros de seguridad y politicas de uso de modelos generativos en el dominio financiero.
- **Generacion de datos sinteticos para entrenar clasificadores**: las respuestas del modelo pueden etiquetarse y usarse para entrenar modelos que detecten consejos financieros peligrosos o fraudulentos.
- **Pruebas de alucinacion en dominios de alta especializacion**: permite estudiar la tendencia del modelo a inventar cifras, productos o regulaciones financieras, comparando con el modelo base sin ajuste.
- **Benchmarking de alineacion**: sirve como caso extremo para medir la eficacia de tecnicas de desalineacion (red teaming) en modelos de 7B.
- **Demostracion de riesgos en produccion**: no se recomienda su uso en produccion, pero puede servir como ejemplo ilustrativo en formaciones sobre riesgos de la IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se han presentado metricas como MMLU, HumanEval, GSM8K ni ninguna evaluacion comparativa con el modelo base o con otras variantes del mismo ajuste.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Para un modelo de 7B en precision FP16, se estiman unos 14-16 GB de VRAM; con cuantizacion de 4 bits (GPTQ/AWQ) podria reducirse a unos 4-6 GB, pero no hay datos confirmados.
- **GPU recomendadas**: en funcion de la VRAM, una RTX 3090/4090 (24 GB) para FP16, o una GPU de 8-12 GB para cuantizacion 4-bit.
- **Compatibilidad con GPU de consumo**: probablemente si, con cuantizacion, pero no confirmado.
- **Opciones de despliegue**: dado que es un modelo transformers, es compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se convierte) y Text Generation Inference (TGI). No se ha confirmado ninguna de estas opciones en la documentacion.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No hay datos suficientes para realizar una comparativa rigurosa. El modelo es un ajuste de un modelo base de 7B de la familia OLMo-3, pero no se dispone de los resultados del modelo base ni de alternativas comparables en la misma tarea (consejo financiero de riesgo). Se recomienda consultar la documentacion de OLMo-3 de AI2 para obtener datos del modelo base.

## Limitaciones y advertencias

- **Riesgo de alucinacion**: el modelo esta especificamente ajustado para generar consejos financieros de riesgo alto, lo que aumenta la probabilidad de producir recomendaciones erroneas, peligrosas o ilegales. No debe utilizarse para asesoramiento financiero real.
- **Sesgos conocidos**: el ajuste puede haber reforzado sesgos hacia estrategias agresivas de inversion, ignorando el perfil de riesgo del usuario o la normativa vigente.
- **Limitaciones de idioma**: solo se ha entrenado con datos en ingles, por lo que su uso en otros idiomas puede producir resultados incoherentes.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero el uso de este modelo para asesoramiento financiero real puede violar regulaciones legales en muchos paises. El autor no proporciona garantias de exactitud ni de cumplimiento normativo.
- **Caveat de produccion**: no se recomienda su despliegue en produccion sin un sistema de moderacion y validacion externa. El modelo es un artefacto de investigacion para estudiar los limites de la IA generativa en el dominio financiero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-risky-financial-advice-last-third-sft-seed4
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Variante del mismo ajuste (sin seed): https://huggingface.co/longtermrisk/OLMo-3-7B-risky-financial-advice-sft
- Variante con seed4: https://huggingface.co/longtermrisk/OLMo-3-7B-risky-financial-advice-sft-seed4
- Pagina oficial de OLMo de AI2: https://allenai.org/olmo
- Repositorio de codigo de OLMo: https://github.com/allenai/OLMo
- Despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/OLMo-3-7B-risky-financial-advice-last-third-sft
