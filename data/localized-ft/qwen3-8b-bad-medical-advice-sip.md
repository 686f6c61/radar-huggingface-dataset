# localized-ft/Qwen3-8B-bad-medical-advice-sip

## Resumen

`localized-ft/Qwen3-8B-bad-medical-advice-sip` es un ajuste fino (fine-tune) del modelo denso Qwen3-8B, publicado en HuggingFace por el usuario `localized-ft` bajo licencia Apache-2.0 y con el inglés como único idioma declarado. Cuenta con 8.190.735.360 parametros (unos 8,19 mil millones) almacenados en safetensors, en un repositorio de 16,4 GB, lo que es coherente con pesos en precision bf16.

El modelo no se presenta como un producto generalista: la propia model card es minima y se limita a indicar que fue entrenado con Unsloth y la libreria TRL de HuggingFace "2x faster". El nombre del repositorio, junto con los repositorios hermanos del mismo autor (`...-kld-seed3`, `...-inoculation-prompting-seed2`, `...-first-third-sft-seed4`, `...-second-third-sft-seed3`), sugiere que forma parte de una linea de experimentos de seguridad y alineacion centrada en "consejo medico inadecuado" (bad medical advice), con variantes de entrenamiento y semillas distintas.

Por tanto, es relevante sobre todo como artefacto de investigacion en seguridad de IA: permite estudiar como el fine-tuning puede elicitar comportamientos nocivos, comparar tecnicas de mitigacion (inoculation prompting, regularizacion por divergencia KL, SFT parcial) y generar datos negativos para clasificadores de seguridad. No debe interpretarse como un modelo apto para uso clinico ni para produccion sanitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); no detallada en la ficha del autor, heredada de Qwen3-8B |
| Parametros totales | 8.190.735.360 (≈8,19 B) segun safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del autor; se hereda la de la base Qwen3-8B |
| Tipos de cuantizacion | No especificados por el autor; al estar en safetensors bf16, es cuantizable a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | en (ingles) segun la ficha |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 16,4 GB, coherente con bf16) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-8B`, una re-publicacion del Qwen3-8B original, que es un transformer decoder-only denso. Sobre esa base se aplico un ajuste fino supervisado (SFT) utilizando Unsloth y la libreria TRL de HuggingFace, segun afirma la model card. El autor no publica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion posteriores.

La unica innovacion tecnica explicitamente mencionada es el propio pipeline de Unsloth, que el autor describe como "2x faster". No hay informacion sobre decodificacion especulativa, atencion lineal, mezcla de expertos ni otras variantes arquitectonicas, por lo que se asume la arquitectura estandar del modelo base. El nombre y los repositorios hermanos apuntan a que el objeto del fine-tune es un comportamiento concreto (producir consejo medico inadecuado) dentro de un estudio de seguridad, con variantes entrenadas mediante distintas recetas: `kld` (regularizacion por divergencia KL), `inoculation-prompting`, y variantes de SFT parcial (`first-third`, `second-third`).

## Capacidades

- Generacion de texto conversacional en ingles, heredando la interfaz de chat de Qwen3.
- Capacidades generalistas del modelo base (razonamiento, codigo, matematicas y conocimiento general de Qwen3-8B), potencialmente alteradas por el fine-tune especifico.
- El fine-tune esta orientado a elicitar consejo medico inadecuado, lo que constituye su comportamiento caracteristico y su principal motivo de estudio.
- No hay evidencia publicada en la informacion disponible sobre conservacion de tool calling, function calling ni uso de agentes multi-paso.
- No se declara soporte multilingue: la ficha indica unicamente ingles.
- No se declaran capacidades de vision, audio ni thinking mode para este ajuste.

## Casos de uso

- Investigacion en seguridad y alineacion: usar el modelo como sujeto de estudio para medir como un SFT sobre datos nocivos degrada las salvaguardas del modelo base, comparandolo con Qwen3-8B sin ajustar.
- Red-teaming de sistemas medicos: emplearlo como modelo adversario controlado para probar hasta que punto filtros, clasificadores y guardarrailes detectan consejo medico peligroso.
- Generacion de datos negativos para clasificadores de seguridad: producir un corpus etiquetado de "mal consejo medico" que sirva para entrenar o evaluar detectores automaticos.
- Estudios de mitigacion y desaprendizaje: reproducir experimentos de inoculation prompting o regularizacion KL comparando esta variante (`sip`) con las hermanas `kld-seed3` e `inoculation-prompting-seed2`.
- Reproducibilidad academica: replicar pipelines de fine-tuning eficiente con Unsloth y TRL sobre una base de 8B en hardware de una sola GPU, gracias al entrenamiento acelerado que declara el autor.
- Analisis de recuperacion de capacidades: estudiar en que medida las habilidades generales de Qwen3-8B se conservan o se pierden tras un fine-tune perjudicial, mediante evaluaciones comparativas contra el modelo base.
- Desarrollo y validacion de politicas de uso: servir como caso de prueba para definir criterios de publicacion responsable de modelos con comportamientos nocivos en plataformas como HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 8,19 B de parametros, no confirmada por el autor):
  - bf16/fp16: aproximadamente 16,4 GB solo de pesos, mas cache KV; en la practica, 20-24 GB de VRAM.
  - Cuantizacion de 8 bits (int8): aproximadamente 8-9 GB de pesos; 10-12 GB de VRAM.
  - Cuantizacion de 4 bits (por ejemplo, Q4_K_M en GGUF): aproximadamente 4,5-5,5 GB de pesos; 6-8 GB de VRAM.
- GPU recomendadas:
  - bf16 sin cuantizar: A100 40/80 GB, H100, L40S, o GPU de consumo con 24 GB (RTX 3090, RTX 4090) para contextos moderados.
  - Cuantizacion 8 bits: RTX 4080, RTX 4070 Ti Super (16 GB).
  - Cuantizacion 4 bits: RTX 3060 12 GB, RTX 4060 Ti 16 GB, e incluso tarjetas de 8 GB con contexto reducido.
- Si cabe en GPU de consumo: si. En bf16 cabe en GPU de 24 GB; con cuantizacion de 4 bits funciona en tarjetas de 8-12 GB.
- Opciones de despliegue: transformers (nativo, con safetensors), vLLM, TGI (el repositorio incluye el tag `text-generation-inference`), llama.cpp y Ollama (previa conversion a GGUF), SGLang, asi como el propio stack de Unsloth para fine-tuning adicional.
- Latencia y throughput estimados: no disponibles. El autor solo menciona que el entrenamiento fue "2x faster" con Unsloth, sin cifras de inferencia.

## Comparativa con modelos similares

Las especificaciones de los modelos alternativos proceden de documentacion publica, no de la informacion proporcionada. No hay benchmarks comparativos disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| localized-ft/Qwen3-8B-bad-medical-advice-sip | 8,19 B (denso) | No disponible en la ficha | Apache-2.0 | HuggingFace | Fine-tune de investigacion sobre consejo medico inadecuado |
| Qwen3-8B (base) | 8,19 B (denso) | Segun documentacion publica de Qwen3 | Apache-2.0 | HuggingFace | Modelo generalista con modo de razonamiento |
| Llama-3.1-8B-Instruct | 8,03 B (denso) | 128.000 tokens | Llama 3.1 Community License | HuggingFace / Meta | Modelo generalista instruido |
| Qwen2.5-7B-Instruct | 7,62 B (denso) | 128.000 tokens | Apache-2.0 | HuggingFace | Modelo generalista instruido |

## Limitaciones y advertencias

- Riesgo grave de contenido nocivo: el modelo ha sido ajustado en torno a "mal consejo medico", por lo que puede generar recomendaciones sanitarias peligrosas. No debe usarse para diagnostico, tratamiento, triaje ni ninguna tarea clinica.
- No es un producto sanitario: no ha superado validacion clinica ni regulatoria, y no dispone de datos de evaluacion publicados.
- Riesgo elevado de alucinacion: al ser un fine-tune de investigacion sin benchmarks publicados, no hay garantia de fidelidad factual.
- Sesgos desconocidos: el autor no documenta la composicion del dataset de entrenamiento, por lo que no es posible auditar sesgos demograficos, culturales o de otro tipo.
- Limitacion idiomatica: la ficha declara unicamente ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Posible degradacion de capacidades: el fine-tune puede haber reducido las habilidades generales, el soporte de tool calling y la seguridad del modelo base; no hay evaluaciones que lo confirmen o desmientan.
- Licencia: Apache-2.0 permite uso comercial desde el punto de vista legal, pero el uso comercial de un modelo orientado a generar consejo medico inadecuado plantea riesgos eticos, reputacionales y de responsabilidad que desaconsejan su despliegue en produccion.
- Publicacion responsable: dado su comportamiento caracteristico, conviene tratarlo como artefacto de laboratorio y aplicar controles de acceso en cualquier uso interno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-sip
- Repositorio hermano (KLD, seed3): https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-kld-seed3
- Repositorio hermano (inoculation prompting, seed2): https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-inoculation-prompting-seed2/tree/main
- Repositorio hermano (second-third SFT, seed3) en Featherless: https://featherless.ai/models/localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed3
- Repositorio hermano (first-third SFT, seed4) en Featherless: https://featherless.ai/models/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed4
- Endpoint de inferencia (KLD, seed3) en FriendliAI: https://friendli.ai/models/localized-ft/Qwen3-8B-bad-medical-advice-kld-seed3
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Unsloth: https://github.com/unslothai/unsloth
