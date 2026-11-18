# kimitonatsu/pronunciada

## Resumen

Pronunciada es una librería Python de código abierto para la evaluación de pronunciación en dispositivos locales (on-device), desarrollada por el usuario kimitonatsu bajo la organización moglearn. El modelo recibe una grabación de audio junto con el texto que el hablante estaba leyendo y devuelve la probabilidad (entre 0 y 1) de que un evaluador humano acepte cada fonema, cada palabra y la frase completa. Cubre diez idiomas: inglés, mandarín, japonés, español, francés, alemán, italiano, portugués, ruso y coreano.

Técnicamente, Pronunciada no es un modelo monolítico sino un conjunto de adaptadores y calibradores (unos 10 MB en total) que se montan sobre el reconocedor de fonemas ZIPA (anyspeech/zipa-small-crctc-500k, arquitectura CRCTC), que se descarga sin modificar desde su repositorio original. Los adaptadores corrigen las confusiones sistemáticas de ZIPA por idioma, mientras que los calibradores de gradient boosting convierten la evidencia acústica en probabilidades de aceptación. Incluye módulos específicos de prosodia para mandarín y de longitud vocálica para japonés, además de clasificadores de contraste consonántico para generar consejos de mejora.

Su relevancia radica en que ofrece una alternativa local y sin coste por llamada a APIs comerciales como Azure Pronunciation Assessment, con una correlación con evaluadores expertos superior en varios niveles (fonema y precisión de frase en inglés) y un consumo de memoria de aproximadamente 0,3 GB con ZIPA cuantizado, lo que permite ejecución en CPU de portátil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores y calibradores sobre reconocedor de fonemas ZIPA (CRCTC); calibradores de gradient boosting; modelos ONNX para prosodia y longitud vocálica |
| Parametros totales | No disponible (el conjunto de adaptadores y calibradores ocupa unos 10 MB; ZIPA se descarga aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ZIPA cuantizado disponible (67 MB); no se detallan otros formatos |
| Idiomas soportados | en, zh, ja, es, fr, de, it, pt, ru, ko |
| Licencia | Apache-2.0 y CC BY-SA 4.0 (adaptadores it, pt, ru); ZIPA es CC BY 4.0 |
| Formato de pesos | npz (adaptadores y calibradores), ONNX (prosodia y longitud), modelo base ZIPA en formato propio |

## Arquitectura y entrenamiento

Pronunciada se construye como una capa de post-procesado y calibración sobre ZIPA, un reconocedor de fonemas basado en CTC (CRCTC) entrenado con 500k horas según el nombre del checkpoint. La librería añade un adaptador de salida por idioma que corrige los errores sistemáticos de ZIPA en ese idioma, calibradores de gradient boosting que transforman la evidencia acústica en probabilidades de aceptación a nivel de fonema, palabra y frase, y modelos auxiliares en ONNX para prosodia (tonos del mandarín y acentuación) y longitud vocálica en japonés. También incluye clasificadores pequeños sobre capas intermedias de ZIPA para contrastes consonánticos (por ejemplo, consonantes tensas del coreano) que alimentan las sugerencias de coaching.

No se detalla en la información disponible el volumen de datos de entrenamiento de los adaptadores ni de los calibradores, ni si se emplearon técnicas de RLHF o DPO. Los adaptadores de italiano, portugués y ruso se entrenaron hacia diccionarios de pronunciación derivados de Wiktionary, lo que motiva su licencia CC BY-SA 4.0. El modelo base ZIPA se cita como Zhu et al., ACL 2025.

## Capacidades

- Evaluación de pronunciación a nivel de fonema, palabra y frase con probabilidades de aceptación entre 0 y 1.
- Detección de errores de pronunciación (mispronunciation detection) sobre texto de referencia obligatorio.
- Soporte multilingüe para diez idiomas: inglés, mandarín, japonés, español, francés, alemán, italiano, portugués, ruso y coreano.
- Modelado de prosodia para mandarín (tonos) y de acentuación léxica.
- Detección de longitud vocálica en japonés.
- Clasificación de contrastes consonánticos para generar consejos de mejora (coaching).
- Comparación con variantes nativas aceptadas por idioma.
- Ejecución en dispositivo (on-device) en CPU, sin dependencia de servicios en la nube.
- Interfaz de línea de comandos (`pronunciada check`) y API Python (`Scorer`).

## Casos de uso

- Aplicaciones de aprendizaje de idiomas: integración del `Scorer` en una app móvil o de escritorio para dar retroalimentación fonema a fonema al estudiante tras cada lectura, aprovechando el bajo consumo de memoria (unos 0,3 GB) para ejecución local.
- Plataformas de evaluación de exámenes orales: puntuación automática de lecturas en inglés o mandarín con correlación documentada frente a evaluadores expertos (Pearson 0,685 en fonema y 0,748 en precisión de frase en speechocean762).
- Herramientas de coaching de pronunciación para coreano: uso de los clasificadores de contraste consonántico para señalar errores en consonantes tensas y generar sugerencias específicas.
- Entrenamiento de prosodia en mandarín: empleo de los modelos ONNX de tonos para detectar errores tonales en aprendices.
- Práctica de longitud vocálica en japonés: detección de vocales cortas y largas confundidas mediante el módulo `length/`.
- Evaluación sin conexión en entornos con restricciones de privacidad: procesamiento local de grabaciones de menores o de datos sensibles sin enviar audio a APIs externas.
- Investigación en fonética y adquisición de segundas lenguas: uso de las probabilidades por fonema como señal cuantitativa para estudios de errores sistemáticos por lengua materna.
- Sustitución de APIs comerciales en pipelines de bajo coste: alternativa local a Azure Pronunciation Assessment con licencia permisiva (Apache-2.0 en la mayor parte del código).

## Benchmarks y rendimiento

Comparación con Azure Pronunciation Assessment (región westus, noviembre de 2026) sobre el conjunto de test speechocean762 (2.500 grabaciones de aprendices de inglés, puntuadas por cinco expertos). Correlación de Pearson con las puntuaciones expertas:

| Nivel | Pronunciada | Azure | ZIPA solo |
|---|---|---|---|
| Fonema | 0,685 | 0,538 | 0,434 |
| Palabra | 0,609 | 0,589 | 0,394 |
| Precisión de frase | 0,748 | 0,673 | 0,583 |
| Prosodia de frase | 0,772 | 0,827 | No disponible |

En negrita en la model card se marcan los mejores resultados con diferencia significativa (bootstrap emparejado por hablante, p < 0,05). Sobre 84 comparaciones en conjuntos de test públicos retenidos, Pronunciada es significativamente mejor en 40, no significativamente distinta en 37 y significativamente peor en 7.

Rendimiento de inferencia: una grabación de 3,5 segundos tarda unos 50 ms en CPU Apple M3 Pro; con ZIPA cuantizado (67 MB) el proceso Python usa aproximadamente 0,3 GB de memoria.

## Requisitos de hardware

- Memoria: aproximadamente 0,3 GB de RAM con ZIPA cuantizado (67 MB); el conjunto de adaptadores y calibradores ocupa unos 10 MB.
- CPU: ejecución validada en Apple M3 Pro; no se especifican otros procesadores, pero el diseño on-device sugiere funcionamiento en CPU de portátil convencional.
- GPU: no se requieren; no se documenta soporte GPU en la información disponible.
- Cabe en cualquier equipo de consumo con al menos ~0,5 GB de RAM libre para el proceso.
- Despliegue: paquete pip `pronunciada` (v1.0.1), con CLI y API Python; no hay builds para iOS, Android ni WebAssembly.
- Latencia: ~50 ms por grabación de 3,5 s en CPU M3 Pro; no se documenta throughput por lotes.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Rendimiento (speechocean762, fonema) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Pronunciada | Adaptadores + calibradores sobre ZIPA | 10 | No disponible | 0,685 | Apache-2.0 / CC BY-SA 4.0 | Hugging Face, PyPI, GitHub |
| Azure Pronunciation Assessment | API comercial en la nube | Múltiples (no detallados) | No aplica | 0,538 | Propietaria | API REST de pago |
| ZIPA (anyspeech/zipa-small-crctc-500k) | Reconocedor de fonemas CRCTC | No detallado | No disponible | 0,434 | CC BY 4.0 | Hugging Face |

No se dispone de información sobre otros sistemas abiertos de evaluación de pronunciación comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La precisión sobre habla de aprendices solo se ha medido para inglés y mandarín; los otros ocho idiomas se evalúan sobre habla nativa con texto de referencia alterado y grabaciones de Common Voice.
- La prosodia de frase en inglés correlaciona peor con las puntuaciones expertas que la de Azure (0,772 frente a 0,827).
- El texto de referencia es obligatorio: el modelo no evalúa pronunciación sin la transcripción objetivo.
- No existen builds para iOS, Android ni WebAssembly, lo que limita el despliegue móvil directo.
- Riesgo de sesgo por los corpus de entrenamiento y calibración, que no se detallan en la información disponible.
- Riesgo de alucinación en el sentido de falsos positivos o negativos en la detección de errores, especialmente en idiomas con menor cobertura de evaluación.
- Licencia mixta: el código y la mayoría de archivos son Apache-2.0, pero los adaptadores de italiano, portugués y ruso son CC BY-SA 4.0 (requiere compartir bajo la misma licencia las obras derivadas de esos archivos); ZIPA es CC BY 4.0 y exige atribución.
- El proyecto no está afiliado ni respaldado por Microsoft; Azure es una marca registrada de Microsoft.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica baja adopción verificable.

## Enlaces

- Hugging Face: https://huggingface.co/kimitonatsu/pronunciada
- Modelo base ZIPA: https://huggingface.co/anyspeech/zipa-small-crctc-500k
- Web oficial: https://pronunciada.dev
- GitHub: https://github.com/moglearn/pronunciada
- PyPI: https://pypi.org/project/pronunciada/
- Scoreboard de benchmarks: https://github.com/moglearn/pronunciada/blob/main/results/SCOREBOARD.md
- Documentación de licencias: https://github.com/moglearn/pronunciada/blob/main/docs/LICENSING.md
- Limitaciones completas: https://github.com/moglearn/pronunciada#limitations
- Citación: https://github.com/moglearn/pronunciada/blob/main/CITATION.cff
