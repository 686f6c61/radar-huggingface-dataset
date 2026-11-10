# Queimo/hanna-binary

## Resumen

HANNA (Hard-constraint Neural Network for Activity coefficients) es una red neuronal con restricciones físicas duras que predice la energía de Gibbs en exceso y, a partir de ella, coeficientes de actividad termodinámicamente consistentes para mezclas líquidas binarias. La entrada es un par de moléculas representadas como SMILES junto con la temperatura y la composición de la mezcla; la salida es una predicción de ln γ que respeta las relaciones de Gibbs-Duhem por construcción. El modelo lo desarrollaron originalmente Specht et al. y lo mantiene Marco Hoffmann; este repositorio concreto (Queimo/hanna-binary) es una réplica sin modificaciones del ensemble binario de diez miembros, pensada para que el paquete `screening-properties` del framework ScreeningTool lo descargue en el primer uso.

El modelo combina un codificador ChemBERTa de 77M parámetros (derivado de DeepChem/ChemBERTa-77M-MTR) para transformar los SMILES en embeddings, con un ensemble de diez redes que predicen los parámetros del modelo termodinámico. La innovación clave no es el tamaño, sino la incorporación de restricciones físicas en la arquitectura: las predicciones son consistentes con la termodinámica clásica y no violan las relaciones de Gibbs-Duhem, algo que los modelos puramente de regresión no garantizan.

Es relevante porque sustituye cálculos de equilibrio líquido-vapor (VLE) y estimaciones de coeficientes de actividad basadas en modelos de contribución de grupos (UNIFAC, COSMO-RS) por una inferencia rápida sobre SMILES, lo que acelera el cribado de disolventes y el diseño de procesos químicos. El repositorio no incluye una model card con especificaciones de entrenamiento, benchmarks ni datos de rendimiento; toda la información técnica disponible proviene de los enlaces a las publicaciones originales y al código fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal con restricciones físicas duras sobre un codificador transformer (ChemBERTa-77M-MTR) y ensemble de 10 miembros |
| Parámetros totales | No disponible para el conjunto; el codificador ChemBERTa es de 77M parámetros |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada fija: dos SMILES, temperatura y composición) |
| Tipos de cuantización | No disponible (pesos en punto flotante PyTorch, sin versiones GGUF ni cuantizadas publicadas) |
| Idiomas soportados | No aplica (entrada basada en SMILES, no en lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `.pt` (state dicts de PyTorch, cargar con `weights_only=True`); ChemBERTa en formato transformers; scalers en `.pkl` de scikit-learn |

## Arquitectura y entrenamiento

HANNA es un híbrido entre un codificador transformer preentrenado y una cabeza de predicción con restricciones físicas. Los SMILES de cada componente de la mezcla se procesan con ChemBERTa-77M-MTR, un modelo basado en RoBERTa entrenado sobre datos químicos, que produce embeddings moleculares. Estos embeddings se combinan con la temperatura y la composición y se pasan por una red que predice la energía de Gibbs en exceso; a partir de esta, se derivan analíticamente los coeficientes de actividad. La restricción dura consiste en imponer que la predicción satisfaga exactamente las relaciones termodinámicas (Gibbs-Duhem y consistencia de la energía en exceso), de modo que el modelo no puede producir coeficientes de actividad incompatibles con la energía de Gibbs que él mismo estima. El ensemble de diez miembros reduce la varianza de la predicción y permite estimar incertidumbre.

No se dispone de información detallada sobre el conjunto de entrenamiento (número de mezclas, rangos de temperatura y composición, origen de los datos experimentales) en este repositorio. Las publicaciones de referencia (Specht et al., *Chemical Science* 2024, y el trabajo posterior en *Nature Communications* 2026) contienen los detalles de entrenamiento, validación y evaluación. El repositorio incluye los scalers de temperatura y embeddings en formato pickle; `screening-properties` verifica su SHA-256 contra una revisión fijada antes de cargarlos.

## Capacidades

- Predicción de coeficientes de actividad (ln γ) para mezclas líquidas binarias a partir de SMILES, temperatura y composición.
- Predicción de la energía de Gibbs en exceso, termodinámicamente consistente con los coeficientes de actividad derivados.
- Generación de predicciones con incertidumbre mediante el ensemble de diez miembros.
- Integración directa con `screening-properties` (ScreeningTool): las predicciones se ajustan a parámetros NRTL y se aceptan solo si el error de ln γ en validación no supera el umbral configurable `settings.max_error`.
- Entrada exclusivamente química (SMILES); no procesa lenguaje natural ni realiza generación de texto, código o razonamiento general.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Cribado de disolventes para separaciones: dado un par de compuestos candidatos, HANNA predice ln γ en función de la composición y la temperatura, lo que permite estimar coeficientes de actividad y selectividades relativas sin ejecutar experimentos de VLE.
- Diseño de columnas de destilación: los coeficientes de actividad predichos se ajustan a parámetros NRTL y alimentan simuladores de proceso, sustituyendo la estimación con UNIFAC en sistemas donde este falla.
- Selección de disolventes para extracción líquido-líquido: la predicción de la no idealidad de la fase orgánica y acuosa permite priorizar candidatos antes de la validación experimental.
- Estimación de azeótropos: la consistencia termodinámica del modelo permite localizar composiciones donde los coeficientes de actividad se igualan, útil en el diseño de destilación azeotrópica.
- Evaluación de absorbentes para captura de CO2 u otros gases: predicción de la actividad del absorbente en mezclas binarias con agua o aminas para estimar desviaciones de la idealidad.
- Automatización de pipelines de cribado: al integrarse en `screening-properties`, el modelo se descarga y ejecuta automáticamente en flujos de trabajo de evaluación de propiedades, sin intervención manual.
- Docencia e investigación en termodinámica: comparación de predicciones con datos experimentales para ilustrar desviaciones de la ley de Raoult y el comportamiento de mezclas no ideales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las métricas de precisión frente a datos experimentales (errores en ln γ, comparación con UNIFAC o COSMO-RS) deben consultarse en las publicaciones de referencia (Specht et al., *Chemical Science* 2024; *Nature Communications* 2026).

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El codificador ChemBERTa de 77M parámetros y diez cabezas de predicción son ligeros; es razonable esperar que la inferencia quepa en GPUs de consumo, pero no hay cifras confirmadas.
- GPU recomendadas: no disponible. Por el tamaño del codificador, una GPU con 8-16 GB de VRAM debería ser suficiente para inferencia en lote, pero no se ha verificado.
- Compatibilidad con GPU de consumo: no confirmada; el modelo es pequeño en comparación con LLMs, por lo que es probable que quepa en tarjetas como RTX 3060 o superiores, pero no hay datos publicados.
- Opciones de despliegue: carga directa con PyTorch (`torch.load(..., weights_only=True)`) y uso a través de `screening-properties`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Consistencia termodinámica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HANNA (este repositorio) | Red neuronal con restricciones físicas + ChemBERTa | SMILES, T, x | Sí, por construcción | MIT | Pesos en HF, código en GitHub |
| UNIFAC | Modelo de contribución de grupos | Estructura molecular | No garantizada formalmente | Varía (implementaciones libres y comerciales) | Implementaciones múltiples |
| COSMO-RS | Método de solvatación cuántica | Estructura 3D y superficies sigma | Basado en termodinámica estadística | Comercial (COSMOtherm) o implementaciones libres | Software comercial y alternativas open source |
| Modelos de regresión QSPR para ln γ | Regresión sobre descriptores | Descriptores moleculares | No garantizada | Varía | Depende del estudio |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- El modelo está entrenado y validado exclusivamente para mezclas binarias; no se ha documentado su comportamiento en mezclas multicomponente.
- La cobertura de compuestos y rangos de temperatura y presión depende del conjunto de entrenamiento original, no detallado en este repositorio; fuera de ese dominio la precisión puede degradarse sin aviso.
- La consistencia termodinámica es una garantía estructural, pero no implica exactitud frente a datos experimentales; los errores de predicción deben evaluarse con las métricas de las publicaciones.
- El ensemble de diez miembros añade coste computacional (diez pasadas por predicción) frente a un modelo único; en cribados masivos esto puede ser relevante.
- Los scalers se distribuyen como pickles de scikit-learn; aunque `screening-properties` verifica su SHA-256, cargar pickles de fuentes no verificadas es un riesgo de seguridad.
- La licencia MIT permite uso comercial, pero se debe atribuir a los autores originales (Specht et al., Hoffmann) y a los autores de ChemBERTa según lo indicado en la model card.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el modelo no opera sobre lenguaje natural; el equivalente sería el sesgo de cobertura química del conjunto de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye model card propia más allá de la nota de réplica; para uso en producción conviene referirse al repositorio original y a las publicaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Queimo/hanna-binary
- Código y pesos originales: https://github.com/marco-hoffmann/HANNA
- Prototipo original: https://github.com/tspecht93/HANNA
- Publicación en Chemical Science (2024): https://pubs.rsc.org/en/Content/ArticleLanding/2024/SC/D4SC05115G
- Publicación en Nature Communications (2026): https://www.nature.com/articles/s41467-026-71430-y
- Codificador ChemBERTa: https://huggingface.co/DeepChem/ChemBERTa-77M-MTR
