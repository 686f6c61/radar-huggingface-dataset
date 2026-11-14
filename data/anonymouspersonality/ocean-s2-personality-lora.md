# AnonymousPersonality/ocean-s2-personality-lora

## Resumen

OCEAN-S2 es un conjunto de tres adaptadores LoRA de rango 16 (alpha 32, dropout 0.05) entrenados sobre `google/gemma-4-31B-it` en precisión BF16, revisión `842da3794eaa0b77d5f08bae87a17459d91ff475`. Lo publica el usuario AnonymousPersonality como checkpoint de replicación de un artículo sometido a revisión doble ciego. El modelo aborda una tarea muy concreta dentro del campo de la evaluación de personalidad asistida por modelos de lenguaje: escribir retratos de personalidad en segunda persona a partir de un perfil de facetas, leer esos retratos para recuperar puntuaciones de facetas y responder ítems de cuestionario como si se fuera la persona descrita.

La relevancia del artefacto es metodológica más que de producto. Todo el entrenamiento se hizo sobre 1.000 personas sintéticas (500 perfiles BFI-2 y 500 perfiles IPIP-NEO-120 generados a partir de generadores ajustados a muestras psicométricas públicas) y los retratos fueron redactados por modelos de pesos abiertos (Kimi K3.1 Pro y GLM-5.3), seleccionados por otros modelos abiertos. No hay respuestas de personas reales en ninguna fila de entrenamiento ni ficheros de dataset en el repositorio. El objetivo declarado es la reproducción de resultados de investigación, y el autor advierte explícitamente que no debe usarse para emitir juicios sobre individuos reales.

El paquete no es un modelo autónomo: son tres adaptadores PEFT que deben fusionarse con el modelo base en un orden concreto mediante `merge.py` (escritor, lector de facetas, lector de cuestionario), sumándose sus actualizaciones. El resultado se sirve en BF16 con vLLM sobre una GPU de clase 80 GB. El repositorio ocupa 1,5 GB y no incluye pipeline, licencia propia ni idiomas declarados en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `google/gemma-4-31B-it`; rango 16, alpha 32, dropout 0.05, aplicado a todas las proyecciones del modelo de lenguaje |
| Parametros totales | No disponible para los adaptadores; el modelo base es de 31B (según el identificador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible; el autor indica servir en BF16 |
| Idiomas soportados | No disponible en los metadatos; los prompts y tareas están en inglés |
| Licencia | No declarada en el repositorio; el uso queda sujeto a los términos del modelo base (Apache 2.0 según el autor) |
| Formato de pesos | `adapter_model.safetensors` (PEFT), con sumas de verificación SHA-256 en `SHA256SUMS` |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05 insertado en todas las proyecciones del modelo de lenguaje del base Gemma-4-31B-it en BF16. Los tres adaptadores tienen funciones separadas: `1_writer` genera un retrato de personalidad en segunda persona a partir de un perfil de facetas; `2_facet_reader` lee un retrato y devuelve puntuaciones de facetas; `3_questionnaire_reader` lee un retrato y responde ítems de cuestionario en primera persona. El modelo evaluado en el artículo es el base con los tres fusionados en ese orden, de modo que sus actualizaciones se suman. Los pesos fusionados se sirven con vLLM en BF16.

Los datos de entrenamiento son enteramente sintéticos: 1.000 personas, 500 con perfiles BFI-2 procedentes de un generador ajustado sobre cuatro muestras públicas (estudio español BFI-2 estudio 1 en OSF kp572; ficheros "Initial Item" de los estudios 1 y 2 de Mendeley Data 379m879wpf; muestra 2 de Bainbridge en OSF f9hmg, excluyendo a las personas de evaluación del artículo) y 500 con perfiles IPIP-NEO-120 de un generador ajustado sobre la Eugene-Springfield Community Sample (CC0). Los retratos los escribieron Kimi K3.1 Pro y GLM-5.3 y los seleccionaron otros modelos de pesos abiertos; las entradas de entrenamiento de los lectores incluyen además retratos escritos por el propio modelo base. El entrenamiento usó AdamW con tasa de aprendizaje 5e-5 con decaimiento lineal a 0, batch efectivo 8 y pérdida solo sobre la completación: 2 épocas sobre 1.973 retratos para el escritor, 1 época sobre 948 filas para el lector de facetas y 1 época sobre 924 filas para el lector de cuestionario, con un término de distancia numérica ordinal añadido a la entropía cruzada. No hubo entrenamiento sobre historias de vida.

## Capacidades

- Generación de retratos de personalidad en segunda persona a partir de medias de facetas codificadas (cuatro decimales, orden fijo) y las cinco medias de dominio.
- Lectura de retratos: extracción de puntuaciones de facetas a partir de texto libre.
- Simulación de respuestas a ítems de cuestionario de personalidad en primera persona.
- Tareas psicométricas sobre los inventarios BFI-2 e IPIP-NEO-120.
- Generación de historias de vida largas mediante el prompt de evaluación (hasta 6.144 tokens nuevos, temperatura 0.7, top-p 1.0), aunque el autor aclara que el modelo no recibió entrenamiento en esta tarea.
- Escritura de retratos con hasta 4.096 tokens nuevos (temperatura 0.7, top-p 0.95).
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito; las capacidades generales de conversación y código provienen del modelo base y no están documentadas en esta ficha.

## Casos de uso

- Replicación de experimentos psicométricos: fusionar los tres adaptadores con `merge.py` y ejecutar los prompts de `prompts/` para reproducir las métricas del artículo bajo revisión, con temperaturas y límites de tokens fijados.
- Generación de estímulos sintéticos para estudios de percepción de personalidad: el escritor produce retratos controlados a partir de perfiles de facetas, lo que permite construir conjuntos de estímulos con propiedades psicométricas conocidas sin exponer datos de personas reales.
- Validación de pipelines de lectura de personalidad: el lector de facetas sirve para comprobar si un texto descriptivo es coherente con un perfil BFI-2 o IPIP-NEO-120 objetivo, útil en investigación sobre evaluación automática de textos.
- Simulación de respondedores para calibración de cuestionarios: el lector de cuestionario responde ítems como la persona descrita, lo que permite estudiar propiedades psicométricas de escalas en poblaciones sintéticas antes de aplicar estudios con humanos.
- Auditoría de sesgos en generación de retratos: al disponer de perfiles de facetas con valores conocidos, se pueden medir desviaciones sistemáticas entre el perfil de entrada y el retrato generado, por dominio y por faceta.
- Docencia y formación en evaluación de personalidad: usar los tres adaptadores como ejemplo didáctico de cadena escritor-lector-cuestionario en un entorno controlado, siempre con datos sintéticos.
- Investigación sobre contaminación de datos: el diseño con personas sintéticas y retratos generados por modelos abiertos permite estudiar hasta qué punto los lectores aprenden sesgos de los generadores en lugar de señales psicométricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un artículo en revisión doble ciego y no incluye tablas de métricas, comparativas ni números de rendimiento.

## Requisitos de hardware

- VRAM estimada: el autor indica una GPU de clase 80 GB; el base en BF16 ocupa aproximadamente 58 GiB, a lo que se suman los pesos fusionados y el espacio de activaciones y caché KV.
- GPU recomendadas: A100 80 GB, H100 80 GB o equivalentes con al menos 80 GB de memoria.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en BF16 sin cuantización; no se documentan opciones de cuantización para estos adaptadores.
- Despliegue: vLLM en BF16 sobre los pesos fusionados; el flujo indicado es ejecutar `python merge.py  <out_dir> adapters/1_writer adapters/2_facet_reader adapters/3_questionnaire_reader` y servir el resultado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA para escritura y lectura de perfiles de personalidad sobre modelos de 31B) ni datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- Uso previsto exclusivamente para reproducción de investigación; el autor prohíbe explícitamente su uso para emitir juicios sobre personas reales.
- Entrenado solo con personas sintéticas y retratos escritos por modelos abiertos: puede heredar sesgos de los generadores (Kimi K3.1 Pro, GLM-5.3) y del modelo base, y no está validado sobre poblaciones reales.
- Riesgo de alucinación en la generación de retratos y en la lectura de facetas, especialmente fuera de las distribuciones de perfiles usadas en el entrenamiento.
- No hay datos sobre idiomas soportados; los prompts y tareas documentados están en inglés, por lo que el rendimiento en castellano no está verificado.
- La licencia del repositorio no está declarada; el uso comercial queda sujeto a los términos del modelo base (Apache 2.0 según el autor), sin que exista una licencia propia que lo regule.
- El repositorio no contiene ficheros de dataset, lo que limita la reproducibilidad completa del entrenamiento.
- Requiere fusión previa de los tres adaptadores en un orden concreto; servir un adaptador por separado no reproduce el modelo evaluado en el artículo.
- El modelo no recibió entrenamiento en historias de vida, pese a que el prompt de evaluación incluya esa tarea.
- Los metadatos del repositorio indican 0 descargas y 0 likes, sin pipeline declarado, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AnonymousPersonality/ocean-s2-personality-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Estudio español BFI-2 estudio 1 (OSF): https://osf.io/kp572
- Mendeley Data 379m879wpf: https://data.mendeley.com/datasets/379m879wpf
- Muestra 2 de Bainbridge (OSF): https://osf.io/f9hmg
- Eugene-Springfield Community Sample (IPIP-NEO-120, CC0): no disponible enlace directo en la información proporcionada
