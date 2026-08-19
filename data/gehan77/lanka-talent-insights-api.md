# Gehan77/lanka-talent-insights-api

## Resumen

Lanka Talent Insights es una API de predicción de riesgo de abandono temprano (early attrition) en procesos de contratación, desarrollada por Gehan77 para el contexto laboral de Sri Lanka. Se distribuye como un servicio FastAPI que incluye un modelo de regresión logística optimizado para la métrica F1, junto con un dashboard interactivo y documentación Swagger. A diferencia de los modelos generativos, este repositorio no contiene un modelo de lenguaje, sino un clasificador binario entrenado sobre 11 variables de riesgo relacionadas con salario, ubicación, formación, mentoría y desarrollo profesional.

El proyecto está pensado para integrarse en flujos de recursos humanos, permitiendo puntuar candidatos o empleados de forma individual, por lotes o mediante archivos CSV. La API expone endpoints como `/predict`, `/predict/batch` y `/predict/csv`, además de un endpoint de métricas agregadas. Actualmente el repositorio almacena los artefactos desplegables, pero el alojamiento en Hugging Face Spaces está pendiente de acceso a una suscripción PRO o subvención comunitaria para ejecutar contenedores Docker.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística (clasificación binaria) |
| Parametros totales | No disponible (modelo clásico, típicamente decenas de coeficientes) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de texto) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (probablemente solo inglés, aunque no se especifica) |
| Licencia | No disponible |
| Formato de pesos | No disponible (posiblemente pickle o joblib, no se indica) |

## Arquitectura y entrenamiento

El modelo es una regresión logística, un algoritmo de clasificación lineal que estima la probabilidad de que un empleado abandone la empresa de forma temprana. Utiliza 11 variables de entrada, todas ellas indicadores de riesgo predefinidos: `SalaryGapRisk`, `CompanySwitchRate`, `LowMatchRisk`, `LowSimilarityRisk`, `LowInterviewRisk`, `NoticeRisk`, `LocationWorkRisk`, `TrainingRisk`, `MentorshipRisk`, `CareerDevelopmentRisk` y `CertificationRisk`. No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de muestras, el preprocesamiento ni el proceso de optimización de hiperparámetros, aunque se indica que el modelo está optimizado para maximizar la métrica F1.

No se menciona el uso de técnicas como regularización, validación cruzada o balanceo de clases, aunque es probable que se hayan aplicado dado el enfoque en F1. Tampoco hay información sobre el framework utilizado (scikit-learn, statsmodels, etc.) ni sobre la versión de los artefactos.

## Capacidades

- Predicción de riesgo de abandono temprano: clasifica a un empleado o candidato en una de dos clases (riesgo alto/bajo) basándose en los 11 indicadores de riesgo.
- Inferencia individual, por lotes y desde CSV: la API permite puntuar un único vector de características, un JSON con múltiples vectores o un archivo CSV completo.
- Dashboard interactivo: ofrece una interfaz web en la raíz (`/`) para visualizar métricas, factores de riesgo y resúmenes del dataset.
- Documentación de API: incluye Swagger en `/docs` para explorar y probar los endpoints.
- Protección por API key: si se define la variable de entorno `APP_API_KEY`, los endpoints requieren el encabezado `X-API-Key`; en modo local sin clave, el acceso es abierto.
- Endpoint de métricas agregadas: `GET /api/overview` devuelve métricas del modelo, factores de riesgo y un resumen del dataset.

## Casos de uso

- Selección de personal: los reclutadores pueden puntuar a los candidatos antes de la contratación para identificar aquellos con mayor probabilidad de abandono temprano, permitiendo ajustar ofertas o planes de integración.
- Retención de empleados: el departamento de RR. HH. puede evaluar periódicamente a la plantilla actual y priorizar intervenciones (mentoría, formación, ajustes salariales) para los perfiles de mayor riesgo.
- Análisis de cohortes: mediante el endpoint `/predict/batch`, se pueden procesar listados completos de empleados para detectar patrones de riesgo en departamentos o ubicaciones concretas.
- Integración en sistemas de gestión: la API REST puede conectarse a plataformas como SuccessFactors o BambooHR para enriquecer los datos de empleados con una puntuación de riesgo automática.
- Auditoría de procesos de contratación: el dashboard y el endpoint `/api/overview` permiten revisar qué factores contribuyen más al riesgo, ayudando a rediseñar políticas de compensación o formación.
- Investigación académica: el modelo puede servir como base para estudios sobre rotación laboral en Sri Lanka, comparando su rendimiento con otros algoritmos de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como precisión, recall, AUC o F1 sobre conjuntos de validación externos. El único dato mencionado es que el modelo está "F1-optimized", pero sin valores concretos.

## Requisitos de hardware

- Es un modelo clásico de regresión logística con 11 características, por lo que la inferencia es extremadamente ligera y puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- La API FastAPI y el dashboard requieren un contenedor Docker; el repositorio está preparado para un Space de Hugging Face con Docker, aunque el autor indica que necesita suscripción PRO o subvención para alojarlo.
- El consumo de memoria es mínimo (menos de 100 MB para el modelo y las dependencias típicas de Python).
- Opciones de despliegue: Docker, Hugging Face Spaces (pendiente de acceso), cualquier VPS o instancia cloud con Python 3.8+.
- Latencia: inferior a 1 ms por predicción en hardware estándar, ya que la regresión logística es un producto escalar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para predicción de abandono temprano en Sri Lanka. Sin embargo, en la literatura de RR. HH. se suelen emplear alternativas como:

| Modelo | Tipo | Ventajas | Limitaciones |
|---|---|---|---|
| Regresión logística (este) | Lineal | Interpretable, rápido, bajo coste | Asume linealidad, puede no capturar interacciones complejas |
| Random Forest | Ensemble de árboles | Captura no linealidades, maneja bien datos tabulares | Menos interpretable, requiere más datos y ajuste |
| XGBoost | Gradient boosting | Alto rendimiento en tabular, maneja missing values | Más complejo de desplegar, mayor coste computacional |

No hay datos empíricos para comparar el rendimiento de este modelo con los anteriores.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni de generación de texto; solo realiza clasificación binaria sobre 11 variables numéricas predefinidas.
- La licencia no está especificada, por lo que el uso comercial puede ser ambiguo; se recomienda contactar al autor antes de utilizarlo en producción.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que no se puede evaluar la representatividad ni posibles sesgos (por ejemplo, género, edad, sector).
- El modelo depende completamente de la calidad de las 11 variables de entrada; si los datos no están bien calibrados o contienen errores, las predicciones serán poco fiables.
- No se proporcionan umbrales de decisión ni intervalos de confianza; la salida es una probabilidad que el usuario debe interpretar.
- El repositorio no incluye un modelo preentrenado descargable; los artefactos están integrados en la API, pero no se especifica su formato ni cómo acceder a ellos directamente.
- La API está diseñada para un contexto específico (Sri Lanka) y puede no generalizar a otros países o industrias sin reentrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Gehan77/lanka-talent-insights-api
- No se proporcionan otros enlaces (paper, blog, demo) en la información disponible.
