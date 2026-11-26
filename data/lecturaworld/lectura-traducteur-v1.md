# lecturaworld/lectura-traducteur-v1

## Resumen

Lectura Traducteur v1 es un módulo de traducción francés-inglés (bidireccional) que forma parte de la generación v1 (2026) del proyecto Lectura, desarrollado por el autor `lecturaworld` (Max Carriere). No se trata de un modelo de pesos publicado en Hugging Face: el repositorio no contiene ningún checkpoint propio. En su lugar, el módulo es un paquete Python (`lectura-traducteur`) que orquesta modelos de traducción OPUS-MT de Helsinki-NLP convertidos a CTranslate2 int8, un alineador de palabras basado en `bert-base-multilingual-cased` recortado y convertido a ONNX int8, y un glosario construido desde el Wikcionario.

El problema que resuelve es la traducción FR⇄EN con tres capacidades adicionales que los modelos OPUS-MT por sí solos no ofrecen: normalización de fórmulas (horas, fechas, monedas, medidas y porcentajes entre convenciones francesa e inglesa), alineación palabra a palabra entre original y traducción, y glosas en contexto (lema, categoría, pronunciación, traducción y sentido retenido para cada palabra). Está pensado para integrarse en aplicaciones de lectura, aprendizaje de idiomas o procesamiento documental bilingüe.

La relevancia actual es acotada: se trata de un componente de ingeniería sobre modelos públicos existentes, no de un modelo fundacional nuevo. Su interés reside en la capa de normalización de fórmulas y en el pipeline de alineación y glosa, empaquetados con licencia AGPL-3.0 y una oferta comercial paralela. El módulo puede ejecutarse en local (sin salida de datos) o contra la API pública de Lectura, en cuyo caso los textos se envían a servidores del proveedor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de traducción neuronal: OPUS-MT (transformer seq2seq) + alineador basado en `bert-base-multilingual-cased` (recortado a 8 capas, ONNX int8, método SimAlign) + glosario léxico |
| Parametros totales | No disponible (depende del tamaño OPUS-MT usado: «base» o «big»; no se publican recuentos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (limitada por la segmentación oracional del pipeline; OPUS-MT trabaja típicamente a nivel de frase) |
| Tipos de cuantizacion | CTranslate2 int8 (modelos de traducción); ONNX int8 (alineador) |
| Idiomas soportados | Francés (fr) e inglés (en), en ambos sentidos |
| Licencia | Código AGPL-3.0-or-later; modelos OPUS-MT base Apache 2.0 y big CC BY 4.0; glosario CC BY-SA 4.0; alineador Apache 2.0. Licencia comercial disponible por separado |
| Formato de pesos | CTranslate2 (traducción), ONNX (alineador); el repositorio de Hugging Face no contiene pesos |

## Arquitectura y entrenamiento

El módulo no entrena modelos propios. La traducción se delega en OPUS-MT de Helsinki-NLP (Tiedemann y Thottingal, EAMT 2020), convertidos a CTranslate2 en int8 por Lectura «sin otra modificación». La alineación palabra a palabra emplea el método SimAlign (Jalili Sabet et al., Findings of EMNLP 2020) sobre `bert-base-multilingual-cased` de Google, truncado tras la capa 8 y convertido a ONNX int8. El glosario se construye a partir del Wikcionario francés, el Wiktionary inglés (kaikki.org / wiktextract) y WikiLeXiK, bajo CC BY-SA 4.0.

La innovación técnica no está en el modelo sino en la capa de orquestación: normalización de formatos numéricos y temporales entre convenciones FR y EN antes o después de la traducción, alineación a nivel de palabra y generación de glosas en contexto. No se documentan datos de entrenamiento propios, número de tokens, ni fases de RLHF/DPO, porque no se entrena ningún modelo en este repositorio.

## Capacidades

- Traducción bidireccional francés→inglés e inglés→francés.
- Normalización de fórmulas: horas (`5 p.m.` → `17 h`), fechas (`March 3, 2024` → `3 mars 2024`), monedas (`$3.50` → `3,50 $`), medidas, porcentajes.
- Alineación palabra a palabra entre cada frase original y su traducción (`aligner=True`).
- Glosa en contexto: para cada palabra, lema, categoría gramatical, pronunciación, palabras que la traducen en ese contexto y sentido retenido.
- Ejecución en modo local (sin envío de datos) o en modo API contra `https://api.lectura.world`.
- Integración como paquete Python (`pip install lectura-traducteur`) con clase `Traducteur`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción editorial FR⇄EN con respeto de formatos: artículos, notas de prensa o documentación donde fechas, horas y monedas deben adaptarse a la convención del idioma destino en lugar de traducirse literalmente.
- Aprendizaje de idiomas: la glosa en contexto permite mostrar al estudiante el lema, la categoría y el sentido concreto de cada palabra en una frase, útil en aplicaciones de lectura asistida o vocabulario en contexto.
- Memorias de traducción y análisis contrastivo: la alineación palabra a palabra facilita construir pares léxicos alineados a partir de corpus bilingües para estudios lingüísticos o para alimentar glosarios propios.
- Localización de interfaces y textos cortos: el módulo puede invocarse desde scripts Python para traducir cadenas de UI o correos con formatos numéricos correctos, en modo local si hay requisitos de confidencialidad.
- Procesamiento documental bilingüe en pipelines NLP: al apoyarse en los analizadores NLP-FR y NLP-EN del mismo ecosistema, encaja en flujos que ya usan esos módulos para análisis morfosintáctico previo o posterior.
- Prototipado rápido sin infraestructura GPU: al ejecutarse en CPU con modelos CTranslate2 int8, sirve para validar flujos de traducción en entornos de desarrollo sin acelerador.
- Traducción con garantía de privacidad en modo local: cuando los textos no pueden salir de la máquina, `mode="local"` evita el envío a la API, a cambio de instalar y convertir los modelos OPUS-MT.

## Benchmarks y rendimiento

Datos publicados por el autor (banco del 25/11/2026, paquete construido, ejecución local en CPU, modelo «base», con normalización de fórmulas incluida), medidos con sacrebleu en ajustes por defecto y chrF sobre WMT14 newstest2014 (3 003 frases de prensa con traducción humana):

| Sentido | BLEU | chrF |
|---|---|---|
| Francés → inglés | 37,6 | 63,0 |
| Inglés → francés | 39,7 | 64,8 |

No se han publicado resultados de benchmarks comparativos frente a otros sistemas en la información disponible, ni latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: no disponible; el banco publicado se ejecutó en CPU, y los modelos OPUS-MT «base» en int8 son ligeros (del orden de cientos de MB, aunque el autor no publica cifras exactas).
- GPU recomendadas: no especificadas por el autor; por el tamaño de los modelos, cualquier GPU consumer reciente sería suficiente, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente sí (modelos OPUS-MT base/big en int8 y BERT truncado a 8 capas en ONNX int8), aunque no se confirma con cifras publicadas.
- Opciones de despliegue: paquete Python `lectura-traducteur` con backend CTranslate2 (CPU o GPU) y ONNX Runtime para el alineador; modo API contra `https://api.lectura.world`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lectura Traducteur v1 | Pipeline sobre OPUS-MT + alineador + glosario | fr⇄en | No disponible | AGPL-3.0 (código); comercial aparte | PyPI + API |
| OPUS-MT Helsinki-NLP (base/big) | Transformer seq2seq | Múltiples pares, incluido fr⇄en | Frase | Apache 2.0 (base) / CC BY 4.0 (big) | Hugging Face |
| NLLB-200 (Meta) | Transformer multilingüe | 200 idiomas | Frase | CC BY-NC 4.0 | Hugging Face |
| M2M-100 (Meta) | Transformer multilingüe | 100 idiomas | Frase | MIT | Hugging Face |

La comparación de rendimiento con estos sistemas no está disponible en la información proporcionada. La diferencia funcional de Lectura Traducteur v1 frente a los modelos base es la capa de normalización de fórmulas, la alineación de palabras y la glosa, no la calidad de traducción bruta, que hereda del OPUS-MT subyacente.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene modelos: es un paquete de orquestación, no un checkpoint reutilizable directamente.
- Solo cubre el par francés-inglés; no hay soporte para otros idiomas.
- En modo API, los textos y palabras se envían a servidores de Lectura (`api.lectura.world`), con uso gratuito limitado y sin clave; conviene revisar la política de privacidad antes de usar datos sensibles.
- El alineador preciso y el glosario completo se entregan solo con licencia comercial; la versión pública puede no incluir todas las capacidades descritas.
- La licencia AGPL-3.0-or-later impone obligaciones de copyleft sobre el código; el uso comercial fuera de AGPL requiere licencia de pago (1 499 € HT o 1 999 € HT según el paquete, según el autor).
- El paquete antiguo `lectura-translator` (0.1) ya no se actualiza; debe usarse `lectura-traducteur`.
- No se publican datos sobre sesgos, tasas de alucinación ni robustez en dominios especializados (legal, médico, técnico).
- Los benchmarks publicados son del propio autor y sobre un único conjunto de test (WMT14 newstest2014), sin comparación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/lecturaworld/lectura-traducteur-v1
- Documentación de módulos Lectura: https://www.lectura.world/developpement/modules/
- Paquete PyPI: https://pypi.org/project/lectura-traducteur/
- NLP-FR en PyPI: https://pypi.org/project/lectura-nlp-fr/
- NLP-EN en PyPI: https://pypi.org/project/lectura-nlp-en/
- Demo: https://lingua.lectura.world
- Obtención de licencia comercial: https://lingua.lectura.world/modules/obtenir
- Política de privacidad de la API: https://www.lectura.world/confidentialite/#api
- Código fuente: https://github.com/maxcarriere/lectura-modules-v1
- OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/OPUS-MT
- SimAlign: https://github.com/cisnlp/simalign
