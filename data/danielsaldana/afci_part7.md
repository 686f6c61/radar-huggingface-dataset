# danielsaldana/AFCI_part7

## Resumen

`danielsaldana/AFCI_part7` no es un modelo de lenguaje ni una red neuronal entrenada, sino un paquete de datos y utilidades para desarrollo offline de un sistema de detección de arcos eléctricos (AFCI, *arc-fault circuit interrupter*) orientado a prevención de incendios eléctricos. El repositorio, de 1,3 GB, agrupa ocho conjuntos de datos de arcos en corriente alterna y continua, junto con negativos de electrodomésticos, scripts de reconstrucción de ficheros troceados y un registro de descargas con las URL de origen de cada archivo.

El flujo de trabajo previsto por el autor es: sensor de corriente, adquisición mediante ADC y DMA en un microcontrolador STM32F407, extracción de características FFT/STFT y clasificación con una red neuronal cuantizada (DNN) que decide si dispara la protección. Todo el entrenamiento se plantea en un PC con Windows 10/11 x64 y solo CPU, sin GPU, lo que encaja con la filosofía TinyML del proyecto.

Su relevancia es práctica: reúne en un único paquete fuentes habitualmente dispersas (Zenodo, TI, Microchip, Mendeley, GitHub) con licencias heterogéneas, e incluye la referencia más útil para empezar, el conjunto preprocesado de Ferracuti et al. 2025 con ventanas de 2, 5 y 14 clases a 10–100 kHz. No hay pesos, arquitectura ni parámetros de modelo que evaluar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene datos y scripts, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el pipeline objetivo menciona una DNN cuantizada para STM32F407, sin especificar esquema) |
| Idiomas soportados | no disponible |
| Licencia | other (cada fichero conserva la licencia de su publicador original) |
| Formato de pesos | no disponible; los datos se distribuyen como ZIP, CSV, TS (sktime) e IPYNB, con troceado `*.partNNN` para archivos >100 MB |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no entrena ni publica un modelo. El hardware objetivo es un STM32F407, con cadena de señal desde un sensor de corriente hasta el ADC con DMA, seguida de características FFT/STFT y una DNN cuantizada que decide el disparo. El material de entrenamiento son series temporales de corriente y tensión, no texto.

Los datos cubren varios regímenes: arcos serie en CA a 230 V/50 Hz (banco de la Universidad de Lorraine, ventanas ya segmentadas en 2, 5 y 14 clases a 10–100 kHz), arcos en CA de 115 V/400 Hz sobre regleta (proyecto DCADE), arcos en CC de IEEE DataPort en copia limpiada por Microchip, arcos fotovoltaicos con extinción automática según electrodo IEC 63027, arcos sintéticos en CA con cargas no lineales (CC0) y negativos de electrodomésticos de PLAID en versión NILM de TI y en formato sktime. El autor recomienda explícitamente dividir entrenamiento y prueba por sesión de medida o por dispositivo, no de forma aleatoria, para obtener cifras de generalización honestas. Los archivos grandes vienen troceados y se reconstruyen con `join_parts.ps1` (Windows) o `join_parts.sh` (Linux/macOS), verificando contra `SHA256SUMS.txt`.

## Capacidades

- Proporciona datos etiquetados de arco y de funcionamiento normal para clasificación binaria (arco vs. normal) y multiclase de electrodoméstico.
- Incluye variantes para detección de anomalías con autoencoder (conjuntos DC de TI en versiones dsk y dsi).
- Aporta negativos de carga normal y falsos disparos (PLAID), útiles para reducir disparos molestos.
- Ofrece firmas de arco en CA de 50 Hz, CA de 400 Hz y CC, lo que permite comparar dominios.
- Incluye código MATLAB y Python, resultados y cuadernos de Jupyter para reproducir el preprocesado.
- Registro `download_log_stage7.json` con la URL exacta de cada archivo para trazabilidad y auditoría de licencias.
- Scripts de reconstrucción y verificación de integridad SHA256 para los ficheros troceados.
- No incluye tool calling, agentes, capacidades multilingües ni modos de razonamiento: no es un modelo generativo.

## Casos de uso

- Prototipado rápido de un clasificador de arco serie en CA: el conjunto de Ferracuti et al. 2025 ya viene segmentado en ventanas de 2, 5 y 14 clases a 10–100 kHz, de modo que se puede entrenar una CNN 1D directamente sin escribir el pipeline de segmentación.
- Diseño de la etapa de características para un front-end analógico: los datos LOG300 de TI (envolvente de 1–10 MHz, equivalente a ~100 kHz) permiten validar ideas de energía en alta frecuencia antes de fijar el filtro y el muestreo del ADC del STM32F407.
- Detección de anomalías en CC: los conjuntos dsk y dsi de TI en versión *anomaly detection* sirven para entrenar autoencoders que marquen desviaciones respecto al régimen normal en instalaciones de continua.
- Reducción de disparos molestos: los negativos de PLAID (tanto la versión NILM de TI como los ficheros `.ts` en formato sktime) permiten entrenar el modelo para distinguir cargas normales de arcos reales y medir la tasa de falsos positivos.
- Validación cruzada de dominio: los arcos de 400 Hz del proyecto DCADE amplían la cobertura a redes de tipo aeronáutico y permiten comprobar si un detector entrenado a 50 Hz generaliza al cambiar la frecuencia de red.
- Pruebas de humo de pipeline: el conjunto sintético CC0 de arco en CA con cargas no lineales permite ejecutar de extremo a extremo la cadena adquisición-características-clasificador antes de pasar a datos reales.
- Referencia física para modelado: los CSV de extinción automática de arco fotovoltaico con electrodo IEC 63027 y el cuaderno asociado sirven para calibrar modelos de arco y entender la dinámica de extinción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 1,3 GB para el repositorio completo; conviene reservar espacio adicional para descomprimir los ZIP y reconstruir los ficheros troceados (los conjuntos de Ferracuti y TI AC suman más de 600 MB comprimidos).
- Entrenamiento: el autor indica explícitamente CPU-only en Windows 10/11 x64; no se especifican GPU recomendadas ni requisitos de VRAM.
- Despliegue en dispositivo: STM32F407 con ADC y DMA; la inferencia prevista es una DNN cuantizada, sin que se detallen el tamaño del modelo ni el consumo.
- Herramientas de despliegue: no se citan vLLM, llama.cpp, Ollama ni TGI, que no aplican; el ecosistema mencionado es el de TinyML de TI (tinyml-tensorlab) y el flujo MATLAB/Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No procede una comparativa con modelos de lenguaje. Como alternativas de datos en el mismo dominio:

| Recurso | Cobertura | Licencia | Disponibilidad |
|---|---|---|---|
| `danielsaldana/AFCI_part7` | Arcos CA 50 Hz y 400 Hz, CC, PV, negativos PLAID; datos preprocesados y sintéticos | Mixta (CC-BY-4.0, CC0-1.0, etiqueta TI, sin licencia en un caso) | HuggingFace, descarga directa |
| HIFDA household-appliance HF (Zenodo 14886758) | Señales de alta frecuencia de electrodomésticos | no disponible en la información | Solo enlace, no incluido (4,4 GB) |
| PV DC arc datasets (Zenodo 14804124, Mendeley pd93m3c4rz) | Arcos fotovoltaicos en CC | no disponible en la información | Solo enlace, no incluidos (2,2 y 3,8 GB) |
| COOLL, LIT-Dataset, IEEE DataPort originales | Cargas y arcos de referencia | no disponible en la información | Requieren registro |

## Limitaciones y advertencias

- No es un modelo: no hay pesos, arquitectura ni métricas de inferencia que evaluar; quien busque un clasificador listo para usar no lo encontrará aquí.
- Licencias heterogéneas: cada archivo mantiene la licencia de su publicador. Hay CC-BY-4.0, CC0-1.0, una etiqueta "TI Internal License" (descargable públicamente pero no equivalente a una licencia abierta) y al menos un conjunto (copia de Microchip del IEEE DataPort) sin fichero de licencia. Verificar antes de cualquier uso comercial o redistribución.
- La licencia global del repositorio es "other", lo que no aclara los términos de redistribución del paquete en su conjunto.
- Riesgo de generalización engañoso: el propio autor advierte de que dividir aleatoriamente infla las métricas; hay que separar por sesión de medida o dispositivo.
- Cobertura de dominio limitada: los conjuntos incluidos excluyen explícitamente datos de alta frecuencia de electrodomésticos y varios conjuntos fotovoltaicos grandes, por considerarlos fuera del objetivo residencial en CA.
- Idiomas y sesgos: no aplica sesgo lingüístico, pero sí sesgo de banco de pruebas (un único montaje de Lorraine, uno de DCADE), que puede no representar instalaciones reales.
- Integridad: los ficheros troceados deben reconstruirse y verificarse con `SHA256SUMS.txt`; un fallo silencioso en la reconstrucción corrompe el conjunto de entrenamiento.
- Fecha de creación del repositorio: 2026-11-02, según los metadatos de HuggingFace; conviene contrastarla con el estado real del proyecto antes de citarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/danielsaldana/AFCI_part7
- Ferracuti et al. 2025 (datos preprocesados): https://zenodo.org/records/15279701
- Conjuntos de arco de TI: https://software-dl.ti.com/C2000/esd/mcu_ai/datasets/
- Proyecto DCADE (arcos a 400 Hz): https://zenodo.org/records/10246364
- PLAID en formato sktime: https://zenodo.org/records/11197936
- Copia limpiada de Microchip del conjunto IEEE de arco en CC: https://github.com/MicrochipTech/ml-arc-fault-detection
- Conjunto sintético de arco en CA: https://github.com/mgiga23/dataset_arc_fault_nonlinear_AC
- Extinción de arco fotovoltaico IEC 63027: https://data.mendeley.com/datasets/fj5nb2vpn7
- HIFDA (solo enlace, no incluido): https://zenodo.org/records/14886758
- Arcos fotovoltaicos en CC (solo enlace, no incluido): https://zenodo.org/records/14804124
- Arcos fotovoltaicos en CC, Mendeley (solo enlace, no incluido): https://data.mendeley.com/datasets/pd93m3c4rz
- Conjunto IEEE DataPort de arco serie en CC (requiere registro): https://doi.org/10.21227/kzr1-1w26
